'use strict';

const initOrm = require('../../orm');
const moment = require('moment-timezone');

module.exports = async function addTripStopSighting(tripId, stopId, seenAtStop, hasDoorsOpen) {
    const orm = await initOrm();

    const tripStop = await orm.models.TripStop.create({
        tripId,
        stopId,
        seenAtStop: moment(seenAtStop).toDate(),
        doorsOpen: hasDoorsOpen,
    });

    return tripStop.get({ plain: true });
};
