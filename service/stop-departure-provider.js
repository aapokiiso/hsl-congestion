'use strict';

const moment = require('moment-timezone');
const hslGraphQL = require('@aapokiiso/hsl-congestion-graphql-gateway');
const hslUtils = require('@aapokiiso/hsl-congestion-utils');
const RemoteServiceUnavailableError = require('../error/remote-service-unavailable-error');

module.exports = {
    /**
     * @param {String} stopId
     * @returns {Promise<Array<Object>>}
     * @throws RemoteServiceUnavailableError
     */
    async getList(stopId) {
        try {
            const departures = await searchDeparturesFromApi(stopId);

            return departures.map(departure => {
                const { trip, realtimeDeparture } = departure;

                return {
                    tripId: trip.gtfsId,
                    departureTime: convertSecondsToDepartureDate(realtimeDeparture),
                };
            });
        } catch (e) {
            console.error(e);

            throw new RemoteServiceUnavailableError(
                `Failed to find departures for stop with ID '${stopId}'`
            );
        }
    },
};

async function searchDeparturesFromApi(stopId) {
    const { stop } = await hslGraphQL.query(`{
            stop(id: "${stopId}") {
                stoptimesWithoutPatterns {
                    trip {
                        gtfsId
                    }
                    realtimeDeparture
                }
            }
        }`);

    const { stoptimesWithoutPatterns: departures } = stop;

    return departures;
}

function convertSecondsToDepartureDate(departureTimeSeconds) {
    const departureDate = hslUtils.departureTime.hasRolledOverToNextDay(departureTimeSeconds)
        ? moment().subtract(1, 'days')
        : moment();

    return hslUtils.departureTime.convertToDate(departureDate, departureTimeSeconds);
}
