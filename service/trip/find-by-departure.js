'use strict';

const initDb = require('../../db');
const departureTimeLib = require('../../include/departure-time');

module.exports = async function findTripByDeparture(routePatternId, departureDate, departureTimeSeconds) {
    const db = await initDb();

    const trip = await db.models.Trip.findOne({
        where: {
            routePatternId,
            departureTime: departureTimeLib.convertToDate(departureDate, departureTimeSeconds),
        },
    });

    return trip ? trip.get({ plain: true }) : null;
};
