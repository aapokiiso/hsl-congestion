'use strict';

module.exports = function (sequelize, DataTypes) {
    const Trip = sequelize.define('Trip', {
        departureDate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        departureTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['routePatternId', 'departureDate', 'departureTime'],
            },
        ],
    });

    Trip.associate = function (models) {
        models.Trip.belongsTo(models.RoutePattern, { as: 'routePattern' });
    };

    return Trip;
};
