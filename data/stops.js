'use strict';

const request = require('request');
const config = require('../config');
const sequelize = require('../sequelize');

const routeTypeIds = {};

sequelize.init()
    .then(seq => {
        return getRoutes(seq.models)
            .then(routes => Promise.all(
                routes.map(route => getRouteStopsData(seq.models, route))
            ))
            .then(routeStopsData => routeStopsData.map(({route, stopsData}) => {
                const saveStops = stopsData.map(stopData => saveStopToRoute(seq.models, route, stopData));

                return Promise.all(saveStops);
            }));
    })
    .catch(err => console.error('Error:', err));

function getRoutes(models) {
    return models.Route.findAll({where: {name: '9'}}); // @tood remove 9
}

function getRouteStopsData(models, route) {
    return new Promise((resolve, reject) => {
        const query = `{
            route(id: "${route.get('gtfsId')}") {
                stops {
                    id
                    gtfsId
                    name
                    lat
                    lon
                }
            }
        }`;

        request.post(config.graphql.url, {
            body: {query},
            json: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }, (err, res, json) => {
            if (err) {
                return reject(err);
            }

            // Remove extra layers from JSON
            const stopsData = json['data']['route']['stops'];

            return resolve({route, stopsData});
        });
    });
}

function saveStopToRoute(models, route, {id, gtfsId, name, lat: latitude, lon: longitude}) {
    return models.Stop.findOrCreate({
        where: {
            id
        }, 
        defaults: {
            routeId: route.get('id')
            gtfsId,
            name,
            latitude,
            longitude
        }
    })
    .then(([stop, created]) => {
        if (!stop) {
            throw new Error(`Stop '${name}' not found and could not be created.`);
        }

        if (created) {
            return stop;
        } else {
            // Update stop before returning
            stop
                .set('routeId', route.get('id'))
                .set('gtfsId', gtfsId)
                .set('name', name)
                .set('latitude', latitude)
                .set('longitude', longitude);

            return stop.save();
        }
    });
}
