'use strict';

const findStopsBeenTo = require('./find-stops-been-to');
const calculateTripDurationAtStop = require('./calc-duration-at-stop');
const calculateAverageDurationAtStop = require('./calc-average-duration-at-stop');

module.exports = async function calculateTripCongestionRate(tripId) {
    const sortedStopDurations = await getSortedStopDurations(tripId);

    const weightedDuration = sortedStopDurations
        .reduce((acc, durations, idx, arr) => {
            const [stopDuration] = durations;

            return acc + stopDuration * getDurationWeight(idx, arr);
        }, 0);

    const weightedAverageDuration = sortedStopDurations
        .reduce((acc, durations, idx, arr) => {
            const [, averageDuration] = durations;

            return acc + averageDuration * getDurationWeight(idx, arr);
        }, 0);

    return weightedDuration && weightedAverageDuration
        ? weightedDuration / weightedAverageDuration
        : 0;
};

/**
 * Get stop durations in seconds for trip,
 * sorted by chronological order (eg. 1st stop on route is 1st in array)
 *
 * @param {Number} tripId
 * @returns {Array<Array<Number, Number>>}
 */
async function getSortedStopDurations(tripId) {
    const stopsBeenTo = await findStopsBeenTo(tripId);

    const stopDurations = await Promise.all(
        stopsBeenTo.map(async stop => [
            stop,
            await calculateTripDurationAtStop(tripId, stop.id),
            await calculateAverageDurationAtStop(stop.id),
        ])
    );

    return stopDurations
        .sort(function restoreStopOrder(a, b) {
            const [stopA] = a;
            const [stopB] = b;

            return stopsBeenTo.indexOf(stopA) - stopsBeenTo.indexOf(stopB);
        })
        .map(([stop, stopDuration, averageDuration]) => [stopDuration, averageDuration]);
}

/**
 * The weight (eg. relevance) of the stop duration
 * decreases the further away into the past it goes
 * (with the rate of 1/x)
 *
 * @param {Number} idx
 * @param {Array<Array<Number, Number>>} allDurations - ordered from first to last stop
 * @returns {Number}
 */
function getDurationWeight(idx, allDurations) {
    return 1 / (allDurations.length - idx);
}
