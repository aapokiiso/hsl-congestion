'use strict';

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

const moment = require('moment-timezone');
const initDb = require('../db');
const filterUnique = require('../include/filter-unique');

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
    }
};

function sumLoadDurationFromTimestampsLog(timestampsLog) {
    return timestampsLog
        .reduce(groupTimestampsByDoorStatusReducer, [])
        .map(mapTimestampGroupDurationWithDoorStatus)
        .filter(timestampGroup => timestampGroup.doorsOpen)
        .reduce(sumTimestampGroupDurationsReducer, 0);
}

function groupTimestampsByDoorStatusReducer(timestampGroups, currentTimestamp) {
    const [previousGroup] = timestampGroups.slice().reverse();

    if (previousGroup && previousGroup.doorsOpen === currentTimestamp.doorsOpen) {
        previousGroup.timestamps.push(currentTimestamp);
    } else {
        timestampGroups.push({
            doorsOpen: currentTimestamp.doorsOpen,
            timestamps: [currentTimestamp],
        });
    }

    return timestampGroups;
}

function mapTimestampGroupDurationWithDoorStatus(timestampGroup) {
    const [firstSeen] = timestampGroup.timestamps;
    const [lastSeen] = timestampGroup.timestamps.slice().reverse();

    const groupDurationInSeconds = moment(lastSeen.seenAtStop)
        .diff(moment(firstSeen.seenAtStop), 'seconds');

    return {
        doorsOpen: timestampGroup.doorsOpen,
        durationInSeconds: groupDurationInSeconds,
    };
}

function sumTimestampGroupDurationsReducer(totalDurationInSeconds, timestampGroup) {
    return totalDurationInSeconds + timestampGroup.durationInSeconds;
}

async function getTimestampsLogByTrip(stopId, tripId) {
    const db = await initDb();

    return db.models.TripStop.findAll({
        where: {
            stopId,
            tripId,
        },
        order: [
            ['seenAtStop', 'ASC'],
        ],
    });
}

async function getTimestampsLogByRoutePattern(stopId, routePatternId) {
    const db = await initDb();

    return db.models.TripStop.findAll({
        include: [
            {
                model: db.models.Trip,
                as: 'trip',
                required: true,
                include: [
                    {
                        model: db.models.RoutePattern,
                        as: 'routePattern',
                        required: true,
                        where: {
                            id: routePatternId
                        }
                    }
                ]
            }
        ],
        where: {
            stopId,
        },
        order: [
            ['seenAtStop', 'ASC'],
        ],
    });
}
