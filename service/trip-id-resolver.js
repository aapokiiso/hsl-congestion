'use strict';

const gtfsIdLib = require('../include/gtfs-id');
const hslGraphQL = require('../hsl-graphql');
const NotFoundError = require('../error/not-found');
const RemoteServiceUnavailableError = require('../error/remote-service-unavailable');

module.exports = {
    /**
     * @param {string} routeId
     * @param {number} directionId
     * @param {string} departureDate - yyyy-mm-dd
     * @param {number} departureTimeSeconds - seconds since start of day
     * @returns {Promise<string>}
     * @throws NotFoundError
     * @throws RemoteServiceUnavailableError
     */
    async findIdByDeparture(routeId, directionId, departureDate, departureTimeSeconds) {
        const routeGtfsId = gtfsIdLib.convertRealtimeApiForRoutingApi(routeId);

        try {
            return await searchTripIdFromApi(
                routeGtfsId,
                directionId,
                departureDate,
                departureTimeSeconds
            );
        } catch (e) {
            if (e instanceof NotFoundError) {
                throw e;
            }

            throw new RemoteServiceUnavailableError(
                `Failed to find trip ID from HSL GraphQL API. Reason: '${e.message}'`
            );
        }
    },
};

async function searchTripIdFromApi(routeGtfsId, directionId, departureDate, departureTimeSeconds) {
    const { fuzzyTrip: trip } = await hslGraphQL.query(`{
                fuzzyTrip(route: "${routeGtfsId}", direction: ${directionId}, date: "${departureDate}", time: ${departureTimeSeconds}) {
                    gtfsId
                }
            }`);

    if (!trip) {
        throw new NotFoundError(
            `Trip details not found for route ID ${routeGtfsId}, direction ${directionId}, departure date ${departureDate}, departure time ${departureTimeSeconds}`
        );
    }

    const { gtfsId: tripId } = trip;

    return tripId;
}
