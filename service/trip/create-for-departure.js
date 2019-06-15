'use strict';

const initOrm = require('../../orm');
const departureTimeLib = require('../../include/departure-time');
const queryGraphQL = require('../../include/query-graphql');
const findRoutePatternById = require('../route-pattern/find-by-id');

module.exports = async function createTripForDeparture(routePatternId, departureDate, departureTimeSeconds) {
    const routePattern = await findRoutePatternById(routePatternId);
    const tripId = await findTripIdFromApi(routePattern.routeId, routePattern.direction, departureDate, departureTimeSeconds);

    if (tripId) {
        const orm = await initOrm();

        const trip = await orm.models.Trip.create({
            id: tripId,
            routePatternId,
            departureTime: departureTimeLib.convertToDate(departureDate, departureTimeSeconds),
        });

        return trip.get({ plain: true });
    }

    return null;
};

async function findTripIdFromApi(routeId, directionId, departureDate, departureTimeSeconds) {
    const { fuzzyTrip: trip } = await queryGraphQL(`{
                fuzzyTrip(route: "${routeId}", direction: ${directionId}, date: "${departureDate}", time: ${departureTimeSeconds}) {
                    gtfsId
                }
            }`);

    if (trip) {
        const { gtfsId: tripId } = trip;

        return tripId;
    }

    return null;
}
