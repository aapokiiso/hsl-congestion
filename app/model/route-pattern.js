'use strict';

const queryGraphql = require('../includes/query-graphql');

module.exports = function (sequelize, DataTypes) {
    const RoutePattern = sequelize.define('RoutePattern', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            comment: 'GTFS ID in HSL Routing API'
        },
        direction: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });

    const Route = sequelize.models.Route || require('./route')(sequelize, DataTypes);
    RoutePattern.belongsTo(Route, {as: 'route'});

    RoutePattern.addHook('afterCreate', 'createStops', routePattern => {
        const {Stop} = sequelize.models;

        return Stop.createAllFromApi(routePattern);
    });

    /**
     * HSL has different direction mappings in their Realtime Vehicle
     * position API and their Routing API.
     *
     * The directions themselves don't hold any meaning, since
     * the route pattern's shape defines them.
     *
     * @type {{realtime_api_direction_id: routing_api_direction_id}}
     */
    RoutePattern.ROUTING_API_DIRECTION_ID = {
        1: 0,
        2: 1,
    };

    RoutePattern.getRoutingApiDirectionId = function (realtimeApiDirectionId) {
        return RoutePattern.ROUTING_API_DIRECTION_ID[realtimeApiDirectionId];
    };

    RoutePattern.findOrCreateFromApi = async function (id) {
        const existingPattern = await RoutePattern.findByPk(id);
        if (existingPattern) {
            return existingPattern;
        }

        const {pattern} = await queryGraphql(`{
            pattern(id: "${id}") {
                directionId
                route {
                    gtfsId
                }
            }
        }`);

        const {gtfsId: routeId} = pattern.route;
        const route = await Route.findOrCreateFromApi(routeId);

        const {directionId: direction} = pattern;

        return RoutePattern.create({
            routeId: route.get('id'),
            id,
            direction,
        });
    };

    return RoutePattern;
};
