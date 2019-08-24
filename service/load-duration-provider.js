'use strict';

const moment = require('moment-timezone');
const {db} = require('@aapokiiso/hsl-congestion-db-schema');

module.exports = {
    async getByTrip(stopId, tripId) {
        const timestampsLog = await getTimestampsLogByTrip(stopId, tripId);

        if (timestampsLog.length) {
            return sumLoadDurationFromTimestampsLog(timestampsLog);
        }

        // Trip has not been on stop yet,
        // or passed it directly without opening doors.

        return 0;
    },
    async getAverageByRoutePattern(stopId, routePatternId) {
        const timestampsLog = await getTimestampsLogByRoutePattern(stopId, routePatternId);

        if (timestampsLog.length) {
            const tripsTotalLoadDuration = sumLoadDurationFromTimestampsLog(timestampsLog);
            const tripsCount = timestampsLog
                .map(timestamp => timestamp.tripId)
                .filter(filterUnique)
                .length;

            return tripsTotalLoadDuration / tripsCount;
        }

        // No trams have been recorded on the route pattern yet.

        return 0;
    },
};

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
 * Pair open-doored timestamp to closed-doored timestamp (and vice versa),
 * so time difference between them can be measured.
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
 * Remove closed-door timestamp groups,
 * we only care how long the doors are open
 * since that's what affects congestion.
 *
 * @param {Object} timestampPair
 * @returns {boolean}
 */
function removeClosedDoorTimestampGroupsFilter(timestampPair) {
    return timestampPair.doorsOpen === true;
}

/**
 * Get time diff between group of timestamps.
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

function getTimestampsLogByTrip(stopId, tripId) {
    return db().models.TripStop.findAll({
        where: {
            stopId,
            tripId,
        },
        order: [
            ['seenAtStop', 'ASC'],
        ],
    });
}

function getTimestampsLogByRoutePattern(stopId, routePatternId) {
    return db().models.TripStop.findAll({
        include: [
            {
                model: db().models.Trip,
                as: 'trip',
                required: true,
                include: [
                    {
                        model: db().models.RoutePattern,
                        as: 'routePattern',
                        required: true,
                        where: {
                            id: routePatternId,
                        },
                    },
                ],
            },
        ],
        where: {
            stopId,
        },
        order: [
            ['seenAtStop', 'ASC'],
        ],
    });
}

/**
 * Remove duplicates from array
 * @param {*} val
 * @param {number} idx
 * @param {Array} arr
 * @returns {boolean}
 */
function filterUnique(val, idx, arr) {
    return arr.indexOf(val) === idx;
}
