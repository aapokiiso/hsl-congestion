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
            .then((routeStopsData) => Promise.all(
                routeStopsData.map(({route, stopsData}) => Promise.all(
                    stopsData.map(stopData => saveStop(seq.models, route, stopData))
                    ).then(stops => route.addStops(stops)))
            ));
    })
    .catch(err => {
        const message = err && err.message ? err.message : err;
        console.error(`Error: ${message}`);
    });

function getRoutes(models) {
    return models.Route.findAll();
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
            const stops = json['data']['route']['stops'];

            return resolve({route, stops});
        });
    });
}

function saveStop(models, route, {id, gtfsId, name, lat: latitude, lon: longitude}) {
    return models.Stop.findOrCreate({
        where: {
            id
        }, 
        defaults: {
            gtfsId,
            name,
            latitude,
            longitude
        }
    })
    .then(([stop, created]) => {
        if (!stop) {
            throw {message: `Stop '${name}' not found and could not be created.`};
        }

        if (created) {
            return stop;
        } else {
            // Update stop before returning
            stop
                .set('gtfsId', gtfsId)
                .set('name', name)
                .set('latitude', latitude)
                .set('longitude', longitude);

            return stop.save();
        }
    });
}
