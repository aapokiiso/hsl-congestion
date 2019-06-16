'use strict';

const Sequelize = require('sequelize');
const initDb = require('../../db');

module.exports = async function hasTripPassedStop(tripId, stopId) {
    const lastSeenAtStop = await getLastSeenAtStop(tripId, stopId);

    return lastSeenAtStop
        ? hasBeenSeenAfter(tripId, lastSeenAtStop)
        : false;
};

async function getLastSeenAtStop(tripId, stopId) {
    const db = await initDb();

    const lastSeenAtStop = await db.models.TripStop.findOne({
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
    const db = await initDb();

    return db.models.TripStop.findOne({
        where: {
            tripId,
            seenAtStop: {
                [Sequelize.Op.gt]: seenAt,
            },
        },
    });
}
