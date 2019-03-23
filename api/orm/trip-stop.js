'use strict';

module.exports = function (sequelize, DataTypes) {
    const TripStop = sequelize.define('TripStop', {
        seenAtStop: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        doorsOpen: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        timestamps: false,
    });

    TripStop.associate = function (models) {
        models.TripStop.belongsTo(models.Trip, { as: 'trip' });
        models.TripStop.belongsTo(models.Stop, { as: 'stop' });
    };

    return TripStop;
};
