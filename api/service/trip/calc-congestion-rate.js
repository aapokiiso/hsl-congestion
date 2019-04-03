'use strict';

const appConfig = require('../../config');
const findStopsBeenTo = require('./find-stops-been-to');
const calculateTripDurationAtStop = require('./calc-duration-at-stop');

module.exports = async function calculateTripCongestionRate(tripId) {
    const sortedStopDurations = await getSortedStopDurations(tripId);

    const durationsWithWeights = sortedStopDurations
        .map((duration, idx, arr) => {
            const maxStopSeconds = getMaxStopDuration(idx, arr);

            return [
                normalizeStopDuration(duration, maxStopSeconds),
                getDurationWeight(idx, arr),
            ];
        });

    const weightedMaxDuration = durationsWithWeights
        .reduce((acc, val, idx, arr) => {
            const [, weight] = val;
            const maxStopSeconds = getMaxStopDuration(idx, arr);

            return acc + maxStopSeconds * weight;
        }, 0);

    const weightedDuration = durationsWithWeights
        .reduce((acc, val) => {
            const [duration, weight] = val;

            return acc + duration * weight;
        }, 0);

    return weightedDuration && weightedMaxDuration
        ? Math.min(weightedDuration / weightedMaxDuration, 1)
        : 0;
};

/**
 * Get stop durations in seconds for trip,
 * sorted by chronological order (eg. 1st stop on route is 1st in array)
 *
 * @param {Number} tripId
 * @returns {Array<Number>}
 */
async function getSortedStopDurations(tripId) {
    const stopsBeenTo = await findStopsBeenTo(tripId);

    const stopDurations = await Promise.all(
        stopsBeenTo.map(async stop => [stop, await calculateTripDurationAtStop(tripId, stop.id)])
    );

    return stopDurations
        .sort(function restoreStopOrder(a, b) {
            const [stopA] = a;
            const [stopB] = b;

            return stopsBeenTo.indexOf(stopA) - stopsBeenTo.indexOf(stopB);
        })
        .map(([stop, stopDuration]) => stopDuration);
}

/**
 * Cap stop duration to configured max stop duration. Assuming that
 * all durations longer than that are due to a technical issue
 * (child trolley trying to get out but stuck, or something like that),
 * there's no point in inflating the congestion rate because of that.
 *
 * @param {Number} durationSeconds
 * @param {Number} maxStopSeconds
 * @returns {Number}
 */
function normalizeStopDuration(durationSeconds, maxStopSeconds) {
    return Math.min(
        durationSeconds,
        maxStopSeconds
    );
}

/**
 * The weight (eg. relevance) of the stop duration
 * decreases the further away into the past it goes
 * (with the rate of 1/x)
 *
 * @param {Number} idx
 * @param {Array<Number>} allDurations - ordered from first to last stop
 * @returns {Number}
 */
function getDurationWeight(idx, allDurations) {
    return 1 / (allDurations.length - idx);
}

/**
 * Congestion rate is approximated based on the highest possible congestion
 * (doors open all the time).
 *
 * For origin terminus, the maximum "stop duration" is longer,
 * because the tram idles at the station for ~12min before departure.
 * During this time, people can enter the tram freely.
 *
 * @param {Number} idx
 * @param {Array<Number>} allDurations - ordered from first to last stop
 * @returns {Number}
 */
function getMaxStopDuration(idx, allDurations) {
    return idx === 0
        ? appConfig.hsl.terminusMaxIdleSeconds
        : appConfig.hsl.maxStopSeconds;
}
