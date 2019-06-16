'use strict';

const initDb = require('../../db');

module.exports = async function findTripById(tripId) {
    const db = await initDb();

    const trip = await db.models.Trip.findByPk(tripId);

    return trip ? trip.get({ plain: true }) : null;
};
