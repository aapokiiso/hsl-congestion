'use strict';

const initOrm = require('../../orm');

module.exports = async function findTripById(tripId) {
    const orm = await initOrm();

    const trip = await orm.models.Trip.findByPk(tripId);

    return trip ? trip.get({ plain: true }) : null;
};
