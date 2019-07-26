'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const stopRepository = require('../service/stop-repository');

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
        const stops = await stopRepository.getList();

        stopsCache.set(
            cacheKey,
            stops.map(stop => stop.get({ plain: true }))
        );

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
        const stop = await stopRepository.getById(stopId);

        stopsCache.set(cacheKey, stop.get({ plain: true }));

        return stop;
    }
});

module.exports = router;
