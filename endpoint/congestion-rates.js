'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const moment = require('moment-timezone');
const tripCongestionRateProvider = require('../service/trip-congestion-rate-provider');

const congestionRatesCache = new NodeCache({
    stdTTL: 5, // Cache rates for 5 seconds to circumvent flooding
    checkperiod: 0,
});

const router = require('express').Router(); // eslint-disable-line new-cap

router.get('/trips/:tripId/congestionRate', async function (req, res) {
    const { tripId } = req.params;
    const { timestamp: timestampStr } = req.query;

    const timestamp = timestampStr ? moment(timestampStr) : moment();

    try {
        const congestionRate = congestionRatesCache.get([tripId, timestamp.toString()].join(''))
            || await getTripCongestionRate(tripId, timestamp);

        res.status(statusCodes.OK).json(congestionRate);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }
});

async function getTripCongestionRate(tripId, timestamp) {
    let congestionRate;
    try {
        congestionRate = await tripCongestionRateProvider.getCongestionRate(tripId, timestamp);
    } catch (e) {
        console.error(e);

        // Congestion rate couldn't be calculated.
        congestionRate = null;
    }

    congestionRatesCache.set([tripId, timestamp.toString()].join(''), congestionRate);

    return congestionRate;
}

module.exports = router;
