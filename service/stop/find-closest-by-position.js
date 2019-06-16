'use strict';

const geolib = require('geolib');
const initDb = require('../../db');
const appConfig = require('../../config');

const twoStopsPerDirectionLimit = 4;

module.exports = async function findClosestByPosition(lat, lon, { limit = twoStopsPerDirectionLimit, page = 0 } = {}) {
    const db = await initDb();

    const stops = await db.models.Stop
        .findAll({
            order: db.literal(`(POW((latitude - ${lat}), 2) + POW((longitude - ${lon}), 2))`),
            limit,
            offset: page * limit,
        });

    return stops
        .map(stop => stop.get({ plain: true }));
};
