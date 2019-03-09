'use strict';

const queryGraphql = require('../includes/query-graphql');

module.exports = function (sequelize, DataTypes) {
    const Route = sequelize.define('Route', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            comment: 'GTFS ID in HSL Routing API'
        },
        mode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });

    Route.getGtfsId = function(realtimeApiRouteId) {
        return `HSL:${realtimeApiRouteId}`;
    };

    Route.findOrCreateFromApi = async function (id) {
        const existingRoute = await Route.findByPk(id);
        if (existingRoute) {
            return existingRoute;
        }

        const {route} = await queryGraphql(`{
            route(id: "${id}") {
                mode
                shortName
            }
        }`);

        const {mode, shortName: name} = route;

        return Route.create({
            id,
            mode,
            name
        });
    };

    return Route;
};
