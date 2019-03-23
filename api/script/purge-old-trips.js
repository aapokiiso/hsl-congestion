'use strict';

const moment = require('moment-timezone');
const findAllRoutePatterns = require('../service/route-pattern/find-all');
const purgeTripsByDayInterval = require('../service/trip/purge-by-day-interval');
const appConfig = require('../config');

(async function IIFE(){
    const routePatterns = await findAllRoutePatterns();
    const oldTripThreshold = moment()
        .subtract(appConfig.hsl.maxTripAgeDays, 'days');

    await Promise.all(
        routePatterns.map(
            routePattern => purgeTripsByDayInterval(routePattern.id, oldTripThreshold)
        )
    );
}());
