'use strict';

const queryGraphql = require('../includes/query-graphql');

module.exports = function (sequelize, DataTypes) {
    const Stop = sequelize.define('Stop', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            comment: 'GTFS ID in HSL Routing API',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
    });

    const RoutePattern = sequelize.models.RoutePattern || require('./route-pattern')(sequelize, DataTypes);
    Stop.belongsTo(RoutePattern, { as: 'routePattern' });

    Stop.createAllFromApi = async function (routePattern) {
        const { pattern } = await queryGraphql(`{
            pattern(id: "${routePattern.get('id')}") {
                stops {
                    gtfsId
                    name
                    lat
                    lon
                }
            }
        }`);

        const { stops } = pattern;

        return stops.map(
            function createStop({
                gtfsId: id,
                name,
                lat: latitude,
                lon: longitude,
            }) {
                return Stop.create({
                    routePatternId: routePattern.get('id'),
                    id,
                    name,
                    latitude,
                    longitude,
                });
            }
        );
    };

    return Stop;
};
