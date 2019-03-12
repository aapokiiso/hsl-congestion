'use strict';

const Sequelize = require('sequelize');
const initOrm = require('../../orm');

module.exports = async function hasTripPassedStop(tripId, stopId) {
    const lastSeenAtStop = await getLastSeenAtStop(tripId, stopId);

    return lastSeenAtStop
        ? hasBeenSeenAfter(tripId, lastSeenAtStop)
        : false;
};

async function getLastSeenAtStop(tripId, stopId) {
    const orm = await initOrm();

    const lastSeenAtStop = await orm.models.TripStop.findOne({
        where: {
            tripId,
            stopId,
        },
        order: [
            ['seenAtStop', 'DESC'],
        ],
    });

    return lastSeenAtStop
        ? lastSeenAtStop.get('seenAtStop')
        : null;
}

async function hasBeenSeenAfter(tripId, seenAt) {
    const orm = await initOrm();

    return orm.models.TripStop.findOne({
        where: {
            tripId,
            seenAtStop: {
                [Sequelize.Op.gt]: seenAt,
            },
        },
    });
}
