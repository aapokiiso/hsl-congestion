'use strict';

const initOrm = require('../../orm');
const moment = require('moment-timezone');

module.exports = async function calculateTripDurationAtStop(tripId, stopId) {
    const timestampsLog = await getTimestampsLog(tripId, stopId);

    if (timestampsLog.length) {
        const [firstSeen] = timestampsLog;
        const [lastSeen] = timestampsLog.reverse();

        return moment(lastSeen.seenAtStop)
            .diff(moment(firstSeen.seenAtStop), 'seconds');
    }

    // Trip has not been on stop yet,
    // or passed it directly without opening doors.

    return 0;
};

async function getTimestampsLog(tripId, stopId) {
    const orm = await initOrm();

    const timestamps = await orm.models.TripStop.findAll({
        where: {
            tripId,
            stopId,
            doorsOpen: true,
        },
        order: [
            ['seenAtStop', 'ASC'],
        ],
    });

    return timestamps
        .map(timestamp => timestamp.get({ plain: true }));
}
