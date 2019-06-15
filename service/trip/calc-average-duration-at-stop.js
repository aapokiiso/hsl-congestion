'use strict';

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

const Sequelize = require('sequelize');
const NodeCache = require('node-cache');
const initOrm = require('../../orm');
const calcDurationAtStop = require('./calc-duration-at-stop');

const averageStopDurationsCache = new NodeCache({ stdTTL: 86400, checkperiod: 0 });

module.exports = async function calculateAverageDurationAtStop(stopId) {
    const cachedAverage = averageStopDurationsCache.get(stopId);
    if (cachedAverage) {
        return cachedAverage;
    }

    const tripIds = await getTripIds(stopId);

    const tripDurations = await Promise.all(
        tripIds.map(tripId => calcDurationAtStop(tripId, stopId))
    );

    const totalDuration = tripDurations
        .reduce((sum, duration) => sum + duration, 0);

    const averageStopDuration = totalDuration / tripIds.length;

    averageStopDurationsCache.set(stopId, averageStopDuration);

    return averageStopDuration;
};

async function getTripIds(stopId) {
    const orm = await initOrm();

    const timestamps = await orm.models.TripStop.findAll({
        attributes: [
            [Sequelize.fn('DISTINCT', Sequelize.col('tripId')), 'tripId'],
        ],
        where: {
            stopId,
        },
    });

    return timestamps
        .map(timestamps => timestamps.get('tripId'));
}
