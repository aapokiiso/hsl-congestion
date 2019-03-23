'use strict';

const gtfsIdLib = require('../../include/gtfs-id');
const queryGraphQL = require('../../include/query-graphql');

const routePatternIdCache = {};

module.exports = async function searchRoutePatternIdByTripDetails(routeId, directionId, departureDate, departureTimeSeconds) {
    const routeGtfsId = gtfsIdLib.convertRealtimeApiForRoutingApi(routeId);

    const cacheKey = [routeGtfsId, directionId, departureDate, departureTimeSeconds].join('-');
    if (routePatternIdCache[cacheKey]) {
        return routePatternIdCache[cacheKey];
    }

    routePatternIdCache[cacheKey] = await searchFromApi(
        routeGtfsId,
        directionId,
        departureDate,
        departureTimeSeconds
    );

    return routePatternIdCache[cacheKey];
};

async function searchFromApi(routeGtfsId, directionId, departureDate, departureTimeSeconds) {
    const { fuzzyTrip: trip } = await queryGraphQL(`{
                fuzzyTrip(route: "${routeGtfsId}", direction: ${directionId}, date: "${departureDate}", time: ${departureTimeSeconds}) {
                    pattern {
                        code
                    }
                }
            }`);

    if (!trip) {
        throw new Error(`Trip details not found for route ID ${routeGtfsId}, direction ${directionId}, departure date ${departureDate}, departure time ${departureTimeSeconds}`);
    }

    const { code: routePatternId } = trip.pattern;

    return routePatternId;
}
