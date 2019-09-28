'use strict';

const moment = require('moment-timezone');
const NodeCache = require('node-cache');
const { db } = require('@aapokiiso/hsl-congestion-db-schema');
const Sequelize = require('sequelize');

const averageLoadDurationsCache = new NodeCache({
    stdTTL: 86400, // Cache averages for one day
    checkperiod: 0,
});

module.exports = {
    /**
     * Calculates realised passenger load time for a trip at a given stop.
     *
     * @param {string} stopId
     * @param {string} tripId
     * @param {Date} timestamp
     * @returns {Promise<number>} Passenger load time in seconds
     */
    async getByTrip(stopId, tripId, timestamp) {
        const timestampsLog = await getTimestampsLogByTrip(stopId, tripId, timestamp);

        if (timestampsLog.length) {
            return sumLoadDurationFromTimestampsLog(timestampsLog);
        }

        // Trip has not been on stop yet,
        // or passed it directly without opening doors.

        return 0;
    },
    /**
     * Calculates average realised passenger load time for a route pattern
     * at a given stop. Used for comparing to live trip passenger load times.
     *
     * @param {string} stopId
     * @param {string} routePatternId
     * @param {Date} timestamp
     * @returns {Promise<number>} Average passenger load time in seconds
     */
    async getAverageByRoutePattern(stopId, routePatternId, timestamp) {
        const cacheKey = [stopId, routePatternId].join();

        const cachedAverage = averageLoadDurationsCache.get(cacheKey);
        if (cachedAverage) {
            return cachedAverage;
        }

        const timestampsLog = await getTimestampsLogForRoutePatternAverage(stopId, routePatternId, timestamp);

        if (timestampsLog.length) {
            const tripsTotalLoadDuration = sumLoadDurationFromTimestampsLog(timestampsLog);

            const tripIds = timestampsLog.map(timestamp => timestamp.tripId);
            const uniqueTripIds = filterUnique(tripIds);
            const tripsCount = uniqueTripIds.length;

            const averageLoadDuration = tripsTotalLoadDuration / tripsCount;

            averageLoadDurationsCache.set(cacheKey, averageLoadDuration);

            return averageLoadDuration;
        }

        // No trams have been recorded on the route pattern yet.

        return 0;
    },
};

/**
 * Sums the passenger load time for a given set of trip stop timestamps.
 * Trip stop timestamps are being continuously logged by
 * a @aapokiiso/hsl-congestion-recorder service.
 *
 * @param {Array<Object>} timestampsLog
 * @returns {number} Passenger load time in seconds
 */
function sumLoadDurationFromTimestampsLog(timestampsLog) {
    return timestampsLog
        .filter(removeAdjacentDuplicateTimestampsFilter)
        .reduce(groupTimestampsByDoorStatusIntervalReducer, [])
        .filter(removeClosedDoorTimestampGroupsFilter)
        .map(timestampGroupToDoorStatusDurationMapper)
        .reduce(sumDoorStatusDurationsReducer, 0);
}

/**
 * Remove possible adjacent timestamps which have the same door status,
 * so that pairs of open-closed door timestamps can be formed reliably.
 *
 * @param {Object} timestamp
 * @param {number} idx
 * @param {Array<Object>} timestamps
 * @returns {boolean}
 */
function removeAdjacentDuplicateTimestampsFilter(timestamp, idx, timestamps) {
    return !timestamps[idx - 1] || timestamp.doorsOpen !== timestamps[idx - 1].doorsOpen;
}

/**
 * Pair adjacent open-doored timestamp to closed-doored timestamp (and vice versa),
 * so that the time difference between them can be measured.
 *
 * @param {Array<Object>} timestampGroups
 * @param {Object} currentTimestamp
 * @returns {Array<Object>}
 */
function groupTimestampsByDoorStatusIntervalReducer(timestampGroups, currentTimestamp) {
    const [latestGroup] = timestampGroups.slice(-1);

    if (!latestGroup) {
        // Initialize first pair
        timestampGroups.push({
            tripId: currentTimestamp.tripId,
            doorsOpen: currentTimestamp.doorsOpen,
            timestamps: [currentTimestamp],
        });

        return timestampGroups;
    }

    if (latestGroup.tripId === currentTimestamp.tripId) {
        // If grouping timestamps from a multi-trip dataset,
        // do not create pairs over differing trips,
        // since the vehicles are different.
        latestGroup.timestamps.push(currentTimestamp);
    }

    timestampGroups.push({
        tripId: currentTimestamp.tripId,
        doorsOpen: currentTimestamp.doorsOpen,
        timestamps: [currentTimestamp],
    });

    return timestampGroups;
}

/**
 * Remove closed-door timestamp groups.
 * We only care how long the doors are open,
 * since that's what affects congestion.
 *
 * @param {Object} timestampPair
 * @returns {boolean}
 */
function removeClosedDoorTimestampGroupsFilter(timestampPair) {
    return timestampPair.doorsOpen === true;
}

/**
 * Get time diff inside group of timestamps. As the timestamps are grouped
 * by door status, each group spans the duration of one doors-open period
 * or one doors-closed period.
 *
 * @param {Object} timestampGroup
 * @returns {{durationInSeconds: number, doorsOpen: boolean}} Door status with duration
 */
function timestampGroupToDoorStatusDurationMapper(timestampGroup) {
    const [firstSeen] = timestampGroup.timestamps;
    const [lastSeen] = timestampGroup.timestamps.slice(-1);

    const pairDurationInSeconds = moment(lastSeen.seenAtStop)
        .diff(moment(firstSeen.seenAtStop), 'seconds');

    return {
        doorsOpen: timestampGroup.doorsOpen,
        durationInSeconds: pairDurationInSeconds,
    };
}

/**
 * Sum time diffs of door status durations.
 *
 * @param {number} totalDurationInSeconds
 * @param {{durationInSeconds: number, doorsOpen: boolean}} doorStatusDuration Door status with duration
 * @returns {number}
 */
function sumDoorStatusDurationsReducer(totalDurationInSeconds, doorStatusDuration) {
    return totalDurationInSeconds + doorStatusDuration.durationInSeconds;
}

/**
 * Looks up trip stop timestamps for a given trip.
 *
 * @param {string} stopId
 * @param {string} tripId
 * @param {Date} timestamp Limit returned timestamps logs to
 *     only those that happened before this point in time
 * @returns {Promise<Array<Object>>}
 */
function getTimestampsLogByTrip(stopId, tripId, timestamp) {
    return db().models.TripStop.findAll({
        attributes: ['tripId', 'doorsOpen', 'seenAtStop'],
        where: {
            stopId,
            tripId,
            seenAtStop: {
                [Sequelize.Op.lte]: timestamp.toDate(),
            },
        },
        order: [
            ['seenAtStop', 'ASC'],
        ],
    });
}

/**
 * Looks up all trip stop timestamps gathered for a route pattern
 * from the last day. An average load duration is calculated based on this.
 *
 * @param {string} stopId
 * @param {string} routePatternId
 * @param {Date} timestamp Limit returned timestamps logs to
 *     only those that happened before this point in time
 * @returns {Promise<Array<Object>>}
 */
function getTimestampsLogForRoutePatternAverage(stopId, routePatternId, timestamp) {
    // Get yesterday's time range from timestamp if provided. Otherwise use current time.
    const yesterday = timestamp.clone().add(-1, 'days');

    return db().models.TripStop.findAll({
        attributes: ['tripId', 'doorsOpen', 'seenAtStop'],
        include: [
            {
                model: db().models.Trip,
                as: 'trip',
                required: true,
                attributes: [],
                include: [
                    {
                        model: db().models.RoutePattern,
                        as: 'routePattern',
                        required: true,
                        attributes: [],
                        where: {
                            id: routePatternId,
                        },
                    },
                ],
            },
        ],
        where: {
            stopId,
            seenAtStop: {
                [Sequelize.Op.gt]: yesterday.toDate(),
                [Sequelize.Op.lte]: timestamp.toDate(),
            },
        },
        order: [
            ['seenAtStop', 'ASC'],
        ],
    });
}

/**
 * Removes duplicates from array
 *
 * @param {Array} arr
 * @returns {Array}
 */
function filterUnique(arr) {
    // Typicaly Array#filter with unique indexOf check is O(n^2),
    // use this Set hack instead to filter out duplicates.
    return [...new Set(arr)];
}
