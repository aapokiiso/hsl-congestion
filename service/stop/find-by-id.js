'use strict';

const initDb = require('../../db');

module.exports = async function findById(stopId) {
    const db = await initDb();

    const stop = await db.models.Stop.findByPk(stopId);

    return stop ? stop.get({ plain: true }) : null;
};
