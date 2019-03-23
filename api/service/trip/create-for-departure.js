'use strict';

const initOrm = require('../../orm');
const departureTimeLib = require('../../include/departure-time');

module.exports = async function createTrip(routePatternId, departureDate, departureTimeSeconds) {
    const orm = await initOrm();

    const trip = await orm.models.Trip.create({
        routePatternId,
        departureTime: departureTimeLib.convertToDate(departureDate, departureTimeSeconds),
    });

    return trip.get({ plain: true });
};
