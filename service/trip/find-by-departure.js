'use strict';

const initOrm = require('../../orm');
const departureTimeLib = require('../../include/departure-time');

module.exports = async function findTripByDeparture(routePatternId, departureDate, departureTimeSeconds) {
    const orm = await initOrm();

    const trip = await orm.models.Trip.findOne({
        where: {
            routePatternId,
            departureTime: departureTimeLib.convertToDate(departureDate, departureTimeSeconds),
        },
    });

    return trip ? trip.get({ plain: true }) : null;
};
