'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const stopDepartureProvider = require('../service/stop-departure-provider');
const tripCongestionRateProvider = require('../service/trip-congestion-rate-provider');

const departuresCache = new NodeCache({ stdTTL: 5, checkperiod: 0 });
const router = require('express').Router(); // eslint-disable-line new-cap

router.get('/departures/:stopId', async function (req, res) {
    const { stopId } = req.params;

    try {
        const departures = departuresCache.get(stopId)
            || await cacheDepartures(stopId);

        res.status(statusCodes.OK).json(departures);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }
});

async function cacheDepartures(stopId) {
    const upcomingDepartures = await stopDepartureProvider.getList(stopId);

    const departuresWithCongestionRates = await Promise.all(
        upcomingDepartures.map(async departure => {
            let congestionRate;
            try {
                congestionRate = await tripCongestionRateProvider.getCongestionRate(departure.tripId);
            } catch (e) {
                // Congestion rate couldn't be calculated.
                congestionRate = null;
            }

            return [
                departure,
                congestionRate,
            ];
        })
    );

    departuresCache.set(stopId, departuresWithCongestionRates);

    return departuresWithCongestionRates;
}

module.exports = router;
