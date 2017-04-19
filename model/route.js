'use strict';

const config = require('../config');

module.exports = function (sequelize, DataTypes) {
    const Route = sequelize.define('Route', {
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
        }
    });

    let RouteType = sequelize.models.RouteType;
    if (!RouteType) {
        RouteType = require('./route-type')(sequelize, DataTypes);
    }

    Route.belongsTo(RouteType, {as: 'type'});

    return Route;
};
