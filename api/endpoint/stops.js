'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const findAllStops = require('../service/stop/find-all');
const findStopById = require('../service/stop/find-by-id');
const findClosestStopsByPosition = require('../service/stop/find-closest-by-position');

const stopsCache = new NodeCache({ stdTTL: 3600, checkperiod: 0 });
const router = require('express').Router(); // eslint-disable-line new-cap

router.get('/stops', async function (req, res) {
    const cacheKey = 'all';

    try {
        const stops = stopsCache.get(cacheKey) || await cacheStops();

        res.status(statusCodes.OK).json(stops);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }

    async function cacheStops() {
        const stops = await findAllStops();

        stopsCache.set(cacheKey, stops);

        return stops;
    }
});

router.get('/stops/:stopId', async function (req, res) {
    const { stopId } = req.params;

    const cacheKey = stopId;

    try {
        const stop = stopsCache.get(cacheKey) || await cacheStop();

        res.status(statusCodes.OK).json(stop);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }

    async function cacheStop() {
        const stop = await findStopById(stopId);

        stopsCache.set(cacheKey, stop);

        return stop;
    }
});

router.get('/stops/:lat/:lon', async function(req, res) {
    const { lat, lon } = req.params;
    const cacheKey = `${lat}-${lon}`;

    try {
        const stops = stopsCache.get(cacheKey) || await cacheStops();

        res.status(statusCodes.OK).json(stops);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }

    async function cacheStops() {
        const stops = await findClosestStopsByPosition(lat, lon);

        stopsCache.set(cacheKey, stops);

        return stops;
    }
});

module.exports = router;
