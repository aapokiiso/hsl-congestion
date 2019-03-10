'use strict';

module.exports = function (sequelize, DataTypes) {
    const TripStop = sequelize.define('TripStop', {
        seenAtStop: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'UNIX timestamp',
        },
    }, {
        timestamps: false,
    });

    const Trip = sequelize.models.Trip || require('./trip')(sequelize, DataTypes);
    TripStop.belongsTo(Trip, { as: 'trip' });

    const Stop = sequelize.models.Stop || require('./stop')(sequelize, DataTypes);
    TripStop.belongsTo(Stop, { as: 'stop' });

    return TripStop;
};
