'use strict';

const initDb = require('../../db');

module.exports = async function findAllStops() {
    const db = await initDb();

    const stops = await db.models.Stop.findAll();

    return stops
        .map(stop => stop.get({ plain: true }));
};
