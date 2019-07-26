'use strict';

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

    Stop.associate = function (models) {
        models.Stop.belongsToMany(models.RoutePattern, { through: 'RoutePatternStops' });
    };

    return Stop;
};
