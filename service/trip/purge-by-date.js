'use strict';

const Sequelize = require('sequelize');
const initOrm = require('../../orm');
const findTripsByDateInterval = require('./find-by-date-interval');

module.exports = async function purgeOldTripsByDate(routePatternId, oldTripThresholdDays) {
    const completedTrips = await findTripsByDateInterval(routePatternId, oldTripThresholdDays);
    const tripIds = completedTrips.map(trip => trip.id);

    const orm = await initOrm();

    return orm.models.Trip.destroy({
        where: {
            id: {
                [Sequelize.Op.in]: tripIds,
            },
        },
    });
};
