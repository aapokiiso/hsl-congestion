'use strict';

const initDb = require('../../db');
const moment = require('moment-timezone');

module.exports = async function calculateTripDurationAtStop(tripId, stopId) {
    const timestampsLog = await getTimestampsLog(tripId, stopId);

    if (timestampsLog.length) {
        return timestampsLog
            .reduce(groupTimestampsByDoorStatusReducer, [])
            .map(mapTimestampGroupDurationWithDoorStatus)
            .filter(timestampGroup => timestampGroup.doorsOpen)
            .reduce(sumTimestampGroupDurationsReducer, 0);
    }

    // Trip has not been on stop yet,
    // or passed it directly without opening doors.

    return 0;
};

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

async function getTimestampsLog(tripId, stopId) {
    const db = await initDb();

    const timestamps = await db.models.TripStop.findAll({
        where: {
            tripId,
            stopId,
        },
        order: [
            ['seenAtStop', 'ASC'],
        ],
    });

    return timestamps
        .map(timestamp => timestamp.get({ plain: true }));
}
