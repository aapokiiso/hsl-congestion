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
    });

    RoutePattern.associate = function (models) {
        models.RoutePattern.belongsTo(models.Route, { as: 'route' });
    };

    return RoutePattern;
};
