'use strict';

const initOrm = require('../../orm');

module.exports = async function createTrip(routePatternId, departureDate, departureTime) {
    const orm = await initOrm();

    const trip = await orm.models.Trip.create({
        routePatternId,
        departureDate,
        departureTime,
    });

    return trip.get({ plain: true });
};
