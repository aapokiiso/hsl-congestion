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
            .then(routeStopsData => Promise.all(
                routeStopsData.map(({route, stopsData}) => {
                    const saveStops = Promise.all(
                        stopsData.map(stopData => saveStop(seq.models, route, stopData))
                    );
                    console.log(route.addStops)
                    saveStops.then(route.addStops);

                    return saveStops;
                })
            ));
    })
    .catch(err => console.error(`Error: ${err.message}`, err.stack));

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
            const stopsData = json['data']['route']['stops'];

            return resolve({route, stopsData});
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
            throw new Error(`Stop '${name}' not found and could not be created.`);
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
