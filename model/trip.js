'use strict';

module.exports = function (sequelize, DataTypes) {
    const Trip = sequelize.define('Trip', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
            comment: 'GTFS ID in HSL Routing API',
        },
    });

    Trip.associate = function (models) {
        models.Trip.belongsTo(models.RoutePattern, { as: 'routePattern', onDelete: 'cascade' });
    };

    return Trip;
};
