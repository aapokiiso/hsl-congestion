'use strict';

const geolib = require('geolib');
const initOrm = require('../../orm');
const appConfig = require('../../config');

const twoStopsPerDirectionLimit = 4;

module.exports = async function findClosestByPosition(lat, lon, { limit = twoStopsPerDirectionLimit, page = 0 } = {}) {
    const orm = await initOrm();

    const stops = await orm.models.Stop
        .findAll({
            order: orm.literal(`(POW((latitude - ${lat}), 2) + POW((longitude - ${lon}), 2))`),
            limit,
            offset: page * limit,
        });

    return stops
        .map(stop => stop.get({ plain: true }));
};
