'use strict';

const appConfig = require('../../config');

module.exports = function calculateTripCongestionRate(sortedStopDurations) {
    const durationsWithWeights = sortedStopDurations
        .map((duration, idx, arr) => [duration, getDurationWeight(idx, arr)]);

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
