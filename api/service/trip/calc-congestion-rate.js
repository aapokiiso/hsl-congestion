'use strict';

const appConfig = require('../../config');
const sortByIndex = require('../../include/sort-by-index');
const findTripPassedStops = require('./find-passed-stops');
const calculateTripDurationAtStop = require('./calc-duration-at-stop');

module.exports = async function calculateTripCongestionRate(tripId) {
    const sortedStopDurations = await getSortedStopDurations(tripId);

    const durationsWithWeights = sortedStopDurations
        .map((duration, idx, arr) => [
            normalizeStopDuration(duration),
            getDurationWeight(idx, arr),
        ]);

    const weightedMaxDuration = durationsWithWeights
        .reduce((acc, val) => {
            const [, weight] = val;

            return acc + appConfig.hsl.maxStopSeconds * weight;
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
    const passedStops = await findTripPassedStops(tripId);

    const stopDurations = await Promise.all(
        passedStops.map(async stop => [stop, await calculateTripDurationAtStop(tripId, stop.id)])
    );

    return stopDurations
        .sort((a, b) => {
            const [stopA] = a;
            const [stopB] = b;

            return sortByIndex(passedStops)(stopA, stopB);
        })
        .map(([stop, stopDuration]) => stopDuration);
}

/**
 * If a tram stops, the doors will be open at least a set
 * amount of time before they can close. Every time someone
 * passes through the doors, the doors get an extra timeout
 * of a few seconds. Ignore the base time in congestion calculation.
 *
 * Cap stop duration to configured max stop duration. Assume that
 * all durations longer than that are due to a technical issue
 * (child trolley trying to get out but stuck, or something like that).
 *
 * @param {Number} durationSeconds
 * @returns {Number}
 */
function normalizeStopDuration(durationSeconds) {
    return Math.min(
        Math.max(durationSeconds - appConfig.hsl.minStopSeconds, 0),
        appConfig.hsl.maxStopSeconds
    );
}

/**
 * The weight (eg. relevance) of the stop duration
 * decreases the further away into the past it goes.
 *
 * @param {Number} idx
 * @param {Array<Number>} allDurations
 * @returns {Number}
 */
function getDurationWeight(idx, allDurations) {
    return 1 / (allDurations.length - idx);
}
