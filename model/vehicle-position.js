'use strict';

const config = require('../config');

module.exports = function (sequelize, DataTypes) {
    const VehiclePosition = sequelize.define('VehiclePosition', {
        vehicleId: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        direction: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        speed: {
            type: DataTypes.INTEGER
        },
        timestamp: {
            type: DataTypes.INTEGER,
            comment: 'From vehicle',
            allowNull: false
        }
    });
    
    let Route = sequelize.models.Route;
    if (!Route) {
        Route = require('./route')(sequelize, DataTypes);
    }

    VehiclePosition.belongsTo(Route, {as: 'route'});

    return VehiclePosition;
};
