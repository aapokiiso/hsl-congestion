'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const findClosestStopsByPosition = require('../service/stop/find-closest-by-position');

const stopsCache = new NodeCache({stdTTL: 3600, checkperiod: 0});
const router = require('express').Router();

router.get('/stops/:lat/:lon', async function(req, res) {
    const {lat, lon} = req.params;

    try {
        const stops = stopsCache.get(getCacheKey(lat, lon))
            || await cacheStops(lat, lon);

        res.status(statusCodes.OK).json(stops);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }
});

async function cacheStops(lat, lon) {
    const stops = await findClosestStopsByPosition(lat, lon);

    stopsCache.set(getCacheKey(lat, lon), stops);

    return stops;
}

function getCacheKey(lat, lon) {
    return `${lat}-${lon}`;
};

module.exports = router;
