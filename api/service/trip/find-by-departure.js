'use strict';

const initOrm = require('../../orm');

module.exports = async function findTripByDeparture(routePatternId, departureDate, departureTime) {
    const orm = await initOrm();

    const trip = await orm.models.Trip.findOne({
        where: {
            routePatternId,
            departureDate,
            departureTime,
        },
    });

    return trip ? trip.get({ plain: true }) : null;
};
