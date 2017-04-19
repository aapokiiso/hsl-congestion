'use strict';

const request = require('request');
const config = require('../config');
const sequelize = require('../sequelize');

const routeTypeIds = {};

sequelize.init()
    .then(seq => {
        return getRoutes(seq.models)
            .then(routes => Promise.all(
                routes.map(route => getRouteStops(seq.models, route))
            ))
            .then((routeStops) => Promise.all(
                routeStops.map(({route, stops}) => stops.map(stop => saveStopToRoute(seq.models, route, stop)))
            ));
    })
    .catch(err => {
        const message = err && err.message ? err.message : err;
        console.error(`Error: ${message}`);
    });

function getRoutes(models) {
    return models.Route.findAll();
}

function getRouteStops(models, route) {
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

function saveStopToRoute(models, route, {id, gtfsId, name, lat: latitude, lon: longitude}) {
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
    })
    .then(stop => route.addStop(stop));
}
