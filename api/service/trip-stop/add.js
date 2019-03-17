'use strict';

const initOrm = require('../../orm');

module.exports = async function createTripStop(tripId, stopId, seenAtStop, hasDoorsOpen) {
    const orm = await initOrm();

    const tripStop = await orm.models.TripStop.create({
        tripId,
        stopId,
        seenAtStop,
        doorsOpen: hasDoorsOpen,
    });

    return tripStop.get({ plain: true });
};
