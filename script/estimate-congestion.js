'use strict';

const findUpcomingTripsByStop = require('../api/service/trip/find-upcoming-by-stop');
const findTripPassedStops = require('../api/service/trip/find-passed-stops');
const calculateTripDurationAtStop = require('../api/service/trip/calc-duration-at-stop');
const calculateCongestionRate = require('../api/service/trip/calc-congestion-rate');
const sortByIndex = require('../api/include/sort-by-index');

(async function IIFE() {
    const upcomingTrips = await findUpcomingTripsByStop('HSL:1220426');
    const tripCongestions = await Promise.all(upcomingTrips.map(getTripCongestionRate));

    tripCongestions.forEach(([durations, congestionRate]) => {
        const percentMultiplier = 100;
        /* eslint-disable-next-line no-console */
        console.log(`
Congestion rate: ${Math.round(congestionRate * percentMultiplier)}%
Stop times:
${durations.map(([stop, duration]) => `${stop.name} ${duration}s`).join('\n')}`);
    });

    async function getTripCongestionRate(trip) {
        const passedStops = await findTripPassedStops(trip.id);

        const stopDurations = await Promise.all(
            passedStops.map(async stop => [stop, await calculateTripDurationAtStop(trip.id, stop.id)])
        );

        const sortedStopDurations = stopDurations
            .sort(sortByIndex(passedStops));

        return [
            sortedStopDurations,
            calculateCongestionRate(sortedStopDurations.map(([, duration]) => duration)),
        ];
    }
}());
