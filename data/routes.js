'use strict';

const request = require('request');
const config = require('../config');
const sequelize = require('../sequelize');

const routeTypeIds = {};

sequelize.init()
    .then(seq => {
        return getRoutes(seq.models)
            .then(routes => Promise.all(
                routes.map(route => saveRoute(seq.models, route))
            ));
    })
    .catch(err => err && err.message ? console.error(err.message) : console.error(err));

function getRoutes(models) {
    return new Promise((resolve, reject) => {
        // HSL Live only available for trams and subways for now 
        const query = `{
            routes(modes: "TRAM,SUBWAY") {
                id
                mode
                gtfsId
                shortName
            }
        }`;

        request({
            url: config.graphql.url, 
            method: config.graphql.method,
            body: {query}
        }, (err, response, body) => {
            if (err) {
                return reject(err);
            }

            let json;
            try {
                json = JSON.parse(body);
            } catch (e) {
                json = {};
            }

            // Remove extra layers from JSON
            const routes = json['data']['routes'];

            return resolve(routes);
        });
    });
}

function saveRoute(models, {id, mode: typeCode, gtfsId, shortName: name}) {
    return getRouteTypeId(models, typeCode)
        .then(typeId => {
            return models.Route.findOrCreate({
                where: {
                    id
                }, 
                defaults: {
                    typeId,
                    gtfsId,
                    name
                }
            })
            // Sequelize 'spread' is 'then' with spreaded obj props as args
            .spread((route, created) => {
                if (!route) {
                    throw {message: `Route '${name}' not found and could not be created.`};
                }

                if (created) {
                    return route;
                } else {
                    // Update route before returning
                    route
                        .set('typeId', typeId)
                        .set('gtfsId', gtfsId)
                        .set('name', name);

                    return route.save();
                }
            });
        });
}

function getRouteTypeId(models, typeCode) {
    if (routeTypeIds[typeCode]) {
        return Promise.resolve(routeTypeIds[typeCode]);
    }

    return models.RouteType
        .findOrCreate({where: {code: typeCode.trim().toLowerCase()}})
        // Sequelize 'spread' is 'then' with spreaded obj props as args
        .spread((type, created) => {
            if (!type) {
                throw {message: `Route type '${typeCode}' not found and could not be created.`};
            }

            routeTypeIds[typeCode] = type.get('id');

            return routeTypeIds[typeCode];
        });
}
