'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const findPatternById = require('../service/route-pattern/find-by-id');

const patternsCache = new NodeCache({ stdTTL: 3600, checkperiod: 0 });
const router = require('express').Router(); // eslint-disable-line new-cap

router.get('/routePatterns/:patternId', async function (req, res) {
    const { patternId } = req.params;

    const cacheKey = patternId;

    try {
        const stop = patternsCache.get(cacheKey) || await cachePattern();

        res.status(statusCodes.OK).json(stop);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }

    async function cachePattern() {
        const pattern = await findPatternById(patternId);

        patternsCache.set(cacheKey, pattern);

        return pattern;
    }
});

module.exports = router;
