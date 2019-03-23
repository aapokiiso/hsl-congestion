'use strict';

const initOrm = require('../../orm');
const findTripsByDateInterval = require('./find-by-date-interval');

module.exports = async function purgeOldTripsByDate(routePatternId, oldTripThresholdDays) {
    const completedTrips = await findTripsByDateInterval(routePatternId, oldTripThresholdDays);

    const orm = await initOrm();

    return Promise.all(
        completedTrips.map(trip => orm.models.Trip.destroy({
            where: {
                id: trip.id,
            },
        }))
    );
};
