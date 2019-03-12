'use strict';

const findStopById = require('../stop/find-by-id');
const findTripsByDayInterval = require('./find-by-day-interval');
const hasTripPassedStop = require('./has-passed-stop');

module.exports = async function findUpcomingTripsByStop(stopId) {
    const stop = await findStopById(stopId);
    const recentTrips = await findTripsByDayInterval(stop.routePatternId, 1);

    const recentTripsWithStopStatus = await Promise.all(
        recentTrips.map(async trip => [
            trip,
            await hasTripPassedStop(trip.id, stop.id),
        ])
    );

    return recentTripsWithStopStatus
        .filter(([trip, hasPassedStop]) => !hasPassedStop)
        .map(([trip]) => trip);
};
