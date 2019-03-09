'use strict';

module.exports = function (sequelize, DataTypes) {
    const VehiclePosition = sequelize.define('VehiclePosition', {
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        timestamp: {
            type: DataTypes.INTEGER,
            comment: 'Timestamp from vehicle',
            allowNull: false
        }
    });

    const Trip = sequelize.models.Trip || require('./trip')(sequelize, DataTypes);
    VehiclePosition.belongsTo(Trip, {as: 'trip'});

    return VehiclePosition;
};
