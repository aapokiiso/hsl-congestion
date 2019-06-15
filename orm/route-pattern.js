'use strict';

module.exports = function importRoutePatternModel(sequelize, DataTypes) {
    const RoutePattern = sequelize.define('RoutePattern', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            comment: 'GTFS ID in HSL Routing API',
        },
        direction: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        headsign: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    RoutePattern.associate = function (models) {
        models.RoutePattern.belongsTo(models.Route, { as: 'route', onDelete: 'cascade' });
    };

    return RoutePattern;
};
