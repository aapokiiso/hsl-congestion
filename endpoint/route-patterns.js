'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const routePatternRepository = require('../service/route-pattern-repository');

const patternsCache = new NodeCache({ stdTTL: 3600, checkperiod: 0 });
const router = require('express').Router(); // eslint-disable-line new-cap

router.get('/routePatterns', async function (req, res) {
    const cacheKey = 'all';

    try {
        const patterns = patternsCache.get(cacheKey) || await cachePatterns();

        res.status(statusCodes.OK).json(patterns);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }

    async function cachePatterns() {
        const patterns = await routePatternRepository.getList();

        patternsCache.set(cacheKey, patterns.map(pattern => pattern.get({plain: true})));

        return patterns;
    }
});

router.get('/routePatterns/:patternId', async function (req, res) {
    const { patternId } = req.params;

    const cacheKey = patternId;

    try {
        const pattern = patternsCache.get(cacheKey) || await cachePattern();

        res.status(statusCodes.OK).json(pattern);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }

    async function cachePattern() {
        const pattern = await routePatternRepository.getById(patternId);

        patternsCache.set(cacheKey, pattern.get({plain: true}));

        return pattern;
    }
});

module.exports = router;
