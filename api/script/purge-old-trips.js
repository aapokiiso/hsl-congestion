'use strict';

const moment = require('moment-timezone');
const findAllRoutePatterns = require('../service/route-pattern/find-all');
const purgeTripsByDate = require('../service/trip/purge-by-date');
const appConfig = require('../config');

(async function IIFE() {
    const routePatterns = await findAllRoutePatterns();
    const oldTripThreshold = moment()
        .subtract(appConfig.hsl.maxTripAgeDays, 'days');

    await Promise.all(
        routePatterns.map(
            routePattern => purgeTripsByDate(routePattern.id, oldTripThreshold)
        )
    );

    process.exit();
}())
    .catch(function (error) {
        console.error(error);
        process.exit();
    });
