'use strict';

const initOrm = require('../../orm');
const findTripsByDayInterval = require('../service/trip/find-by-day-interval');

module.exports = async function purgeOldRoutePatternTrips(routePatternId, oldTripThresholdDays) {
    const completedTrips = await findTripsByDayInterval(routePatternId, oldTripThresholdDays);

    const orm = await initOrm();

    return Promise.all(
        completedTrips.map(trip => orm.models.Trip.destroy({
            where: {
                id: trip.id,
            },
        }))
    );
};
