'use strict';

module.exports = function (sequelize, DataTypes) {
    const Trip = sequelize.define('Trip', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            comment: 'GTFS ID in HSL Routing API',
        },
        departureTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });

    Trip.associate = function (models) {
        models.Trip.belongsTo(models.RoutePattern, { as: 'routePattern' });
    };

    return Trip;
};
