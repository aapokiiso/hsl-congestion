'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const tripCongestionRateProvider = require('../service/trip-congestion-rate-provider');

const congestionRatesCache = new NodeCache({
    stdTTL: 5, // Cache rates for 5 seconds to circumvent flooding
    checkperiod: 0,
});

const router = require('express').Router(); // eslint-disable-line new-cap

router.get('/trips/:tripId/congestionRate', async function (req, res) {
    const { tripId } = req.params;

    try {
        const departures = congestionRatesCache.get(tripId)
            || await getTripCongestionRate(tripId);

        res.status(statusCodes.OK).json(departures);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }
});

async function getTripCongestionRate(tripId) {
    let congestionRate;
    try {
        congestionRate = await tripCongestionRateProvider.getCongestionRate(tripId);
    } catch (e) {
        console.error(e);

        // Congestion rate couldn't be calculated.
        congestionRate = null;
    }

    congestionRatesCache.set(tripId, congestionRate);

    return congestionRate;
}

module.exports = router;
