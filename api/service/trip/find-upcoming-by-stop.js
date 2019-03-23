'use strict';

const moment = require('moment-timezone');
const findStopById = require('../stop/find-by-id');
const findTripById = require('./find-by-id');
const queryGraphQL = require('../../include/query-graphql');
const departureTimeLib = require('../../include/departure-time');

module.exports = async function findUpcomingTripsByStop(stopId) {
    const { routePatternId } = await findStopById(stopId);
    const departures = await findStopDeparturesFromApi(stopId, routePatternId);

    const tripsForStop = await Promise.all(
        departures.map(async function (departure) {
            const { gtfsId: tripId } = departure.trip;
            const trip = await findTripById(tripId);
            if (trip) {
                const { realtimeDeparture } = departure;
                trip.stopDepartureTime = convertSecondsToDepartureDate(realtimeDeparture);
            }

            return trip;
        })
    );

    return tripsForStop
        .filter(trip => trip);
};

async function findStopDeparturesFromApi(stopId, routePatternId) {
    const { stop } = await queryGraphQL(`{
            stop(id: "${stopId}") {
                stopTimesForPattern(id: "${routePatternId}") {
                    trip {
                        gtfsId
                    }
                    realtimeDeparture
                }
            }
        }`);

    const { stopTimesForPattern: departures } = stop;

    return departures;
}

function convertSecondsToDepartureDate(departureTimeSeconds) {
    const departureDate = departureTimeLib.hasRolledOverToNextDay(departureTimeSeconds)
        ? moment().subtract(1, 'days')
        : moment();

    return departureTimeLib.convertToDate(departureDate, departureTimeSeconds);
}
