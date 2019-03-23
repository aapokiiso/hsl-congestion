'use strict';

const mqtt = require('mqtt');
const appConfig = require('../config');
const directionIdLib = require('../include/direction-id');
const departureTimeLib = require('../include/departure-time');
const searchRoutePatternIdByTripDetails = require('../service/route-pattern/search-id-by-trip-details');
const findRoutePatternById = require('../service/route-pattern/find-by-id');
const findStopByPositionForRoutePattern = require('../service/route-pattern/find-stop-by-position');
const findTripByDeparture = require('../service/trip/find-by-departure');
const createTripForDeparture = require('../service/trip/create-for-departure');
const addTripStopSighting = require('../service/trip/add-stop-sighting');

(function IIFE() {
    const mqttClient = initMqtt([
        '/hfp/v1/journey/ongoing/tram/+/+/1007/#',
        '/hfp/v1/journey/ongoing/tram/+/+/1007H/#',
    ]);

    mqttClient.on('message', async (topic, message) => {
        const messageStr = message.toString();
        const routeId = parseRouteIdFromTopic(topic);

        try {
            const { VP: vehiclePosition } = JSON.parse(messageStr);
            await logVehicleStopProximity(routeId, vehiclePosition);
        } catch (e) {
            console.error(e, messageStr);
        }
    });

    function initMqtt(topics) {
        return mqtt
            .connect({
                host: appConfig.mqtt.host,
                port: appConfig.mqtt.port,
            })
            .subscribe(topics);
    }

    function parseRouteIdFromTopic(topic) {
        const [, , , , , , , , routeId] = topic.split('/');

        return routeId;
    }

    async function logVehicleStopProximity(routeId, {
        dir: realtimeApiDirectionId,
        lat: latitude,
        long: longitude,
        tst: seenAtStop,
        oday: departureDate,
        start: departureTime,
        drst: hasDoorsOpen,
    }) {
        const directionId = directionIdLib.convertRealtimeApiForRoutingApi(realtimeApiDirectionId);
        const departureTimeSeconds = departureTimeLib.convertToSeconds(
            departureTime,
            departureTimeLib.hasRolledOverToNextDay(departureDate, seenAtStop)
        );

        const routePatternId = await searchRoutePatternIdByTripDetails(routeId, directionId, departureDate, departureTimeSeconds);
        const routePattern = routePatternId ? await findRoutePatternById(routePatternId) : null;

        if (routePattern) {
            const stop = await findStopByPositionForRoutePattern(routePattern.id, latitude, longitude);

            if (stop) {
                const trip = await findTripByDeparture(routePattern.id, departureDate, departureTimeSeconds)
                    || await createTripForDeparture(routePattern.id, departureDate, departureTimeSeconds);

                await addTripStopSighting(trip.id, stop.id, seenAtStop, hasDoorsOpen);
            }
        }
    }
}());
