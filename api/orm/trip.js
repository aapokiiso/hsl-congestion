'use strict';

module.exports = function (sequelize, DataTypes) {
    const Trip = sequelize.define('Trip', {
        departureTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['routePatternId', 'departureTime'],
            },
        ],
    });

    Trip.associate = function (models) {
        models.Trip.belongsTo(models.RoutePattern, { as: 'routePattern' });
    };

    return Trip;
};
