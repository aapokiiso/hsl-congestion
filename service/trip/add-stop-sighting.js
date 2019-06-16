'use strict';

const initDb = require('../../db');
const moment = require('moment-timezone');

module.exports = async function addTripStopSighting(tripId, stopId, seenAtStop, hasDoorsOpen) {
    const db = await initDb();

    const tripStop = await db.models.TripStop.create({
        tripId,
        stopId,
        seenAtStop: moment(seenAtStop).toDate(),
        doorsOpen: hasDoorsOpen,
    });

    return tripStop.get({ plain: true });
};
