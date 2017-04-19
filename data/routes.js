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
    .catch(err => console.error('Error:', err));

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
            .then(([route, created]) => {
                if (!route) {
                    throw new Error(`Route '${name}' not found and could not be created.`);
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
        .then(([type, created]) => {
            if (!type) {
                throw new Error(`Route type '${typeCode}' not found and could not be created.`);
            }

            routeTypeIds[typeCode] = type.get('id');

            return routeTypeIds[typeCode];
        });
}
