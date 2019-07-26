'use strict';

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

const moment = require('moment-timezone');
const hslGraphQL = require('../include/hsl-graphql');
const departureTimeLib = require('../include/departure-time');
const RemoteServiceUnavailableError = require('../error/remote-service-unavailable');

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
                    departureTime: convertSecondsToDepartureDate(realtimeDeparture)
                }
            });
        } catch (e) {
            console.error(e);

            throw new RemoteServiceUnavailableError(
                `Failed to find departures for stop with ID '${stopId}'`
            );
        }
    }
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
    const departureDate = departureTimeLib.hasRolledOverToNextDay(departureTimeSeconds)
        ? moment().subtract(1, 'days')
        : moment();

    return departureTimeLib.convertToDate(departureDate, departureTimeSeconds);
}
