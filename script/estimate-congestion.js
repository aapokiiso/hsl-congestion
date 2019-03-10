'use strict';

const db = require('../db');

(async function IIFE() {
    const dbInstance = await db.init();

    const { Stop, Trip, TripStop } = dbInstance.models;

    const upcomingTrips = await getUpcomingTrips('HSL:1220426');
    const tripCongestions = await Promise.all(upcomingTrips.map(getTripCongestionRate));

    tripCongestions.forEach(([durations, congestionRate]) => {
        const percentMultiplier = 100;
        /* eslint-disable-next-line no-console */
        console.log(`
Congestion rate: ${Math.round(congestionRate * percentMultiplier)}%
Stop times: ${durations.join('s, ')}s`);
    });

    async function getUpcomingTrips(stopId) {
        const stop = await Stop.findByPk(stopId);
        const recentTrips = await Trip.findTripsFromLastDay(stop.get('routePatternId'));

        const recentTripsWithStopStatus = await Promise.all(
            recentTrips.map(async trip => [
                trip,
                await TripStop.hasTripPassedStop(trip, stop),
            ])
        );

        return recentTripsWithStopStatus
            .filter(([trip, hasPassedStop]) => !hasPassedStop)
            .map(([trip]) => trip);
    }

    async function getTripCongestionRate(trip) {
        const passedStops = await TripStop.findTripPassedStops(trip);

        const stopDurations = await Promise.all(
            passedStops.map(stop => TripStop.getTripDurationAtStop(trip, stop))
        );

        return [stopDurations, TripStop.getCongestionRate(stopDurations)];
    }
}());
