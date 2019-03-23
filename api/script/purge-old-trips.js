'use strict';

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

const findAllRoutePatterns = require('../service/route-pattern/find-all');
const purgeTripsByDayInterval = require('../service/trip/purge-by-day-interval');

(async function IIFE(){
    const routePatterns = await findAllRoutePatterns();
    const oldTripThresholdDays = 2;

    await Promise.all(
        routePatterns.map(
            routePattern => purgeTripsByDayInterval(routePattern.id, oldTripThresholdDays)
        )
    );
}());
