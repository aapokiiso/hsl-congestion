'use strict';

const config = require('../config');

module.exports = function (sequelize, DataTypes) {
    const Stop = sequelize.define('Stop', {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        gtfsId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: false
        }
    });

    let Route = sequelize.models.Route;
    if (!Route) {
        Route = require('./route')(sequelize, DataTypes);
    }

    Stop.belongsTo(Route, {as: 'route'});

    return Stop;
};
