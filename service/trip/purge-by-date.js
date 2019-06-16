'use strict';

const Sequelize = require('sequelize');
const initDb = require('../../db');
const findTripsByDateInterval = require('./find-by-date-interval');

module.exports = async function purgeOldTripsByDate(routePatternId, oldTripThresholdDays) {
    const completedTrips = await findTripsByDateInterval(routePatternId, oldTripThresholdDays);
    const tripIds = completedTrips.map(trip => trip.id);

    const db = await initDb();

    return db.models.Trip.destroy({
        where: {
            id: {
                [Sequelize.Op.in]: tripIds,
            },
        },
    });
};
