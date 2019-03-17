'use strict';

const NodeCache = require('node-cache');
const statusCodes = require('http-status-codes');
const sortByIndex = require('../include/sort-by-index');
const findUpcomingTripsByStop = require('../service/trip/find-upcoming-by-stop');
const calcTripCongestionRate = require('../service/trip/calc-congestion-rate');

const departuresCache = new NodeCache({ stdTTL: 5, checkperiod: 0 });
const router = require('express').Router(); // eslint-disable-line new-cap

router.get('/departures/:stopId', async function (req, res) {
    const { stopId } = req.params;

    try {
        const congestionRates = departuresCache.get(stopId)
            || await cacheCongestionRates(stopId);

        res.status(statusCodes.OK).json(congestionRates);
    } catch (e) {
        console.error(e);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({});
    }
});

async function cacheCongestionRates(stopId) {
    const upcomingTrips = await findUpcomingTripsByStop(stopId);
    const congestionRates = await Promise.all(
        upcomingTrips.map(async trip => [trip, await calcTripCongestionRate(trip.id)])
    );

    const sortedCongestionRates = congestionRates.sort((a, b) => {
        const [tripA] = a;
        const [tripB] = b;

        return sortByIndex(upcomingTrips)(tripA, tripB);
    });

    departuresCache.set(stopId, sortedCongestionRates);

    return sortedCongestionRates;
}

module.exports = router;
