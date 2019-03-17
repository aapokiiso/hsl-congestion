'use strict';

const mqtt = require('mqtt');
const appConfig = require('../api/config');
const orm = require('../api/orm')();
const directionIdLib = require('../api/include/direction-id');
const searchRoutePatternIdByTripDetails = require('../api/service/route-pattern/search-id-by-trip-details');
const findRoutePatternById = require('../api/service/route-pattern/find-by-id');
const findStopByPositionForRoutePattern = require('../api/service/route-pattern/find-stop-by-position');
const findTripByDeparture = require('../api/service/trip/find-by-departure');
const createTrip = require('../api/service/trip/create');
const addTripStop = require('../api/service/trip-stop/add');

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
        tsi: seenAtStop,
        oday: departureDate,
        start: departureTime,
        drst: hasDoorsOpen,
    }) {
        const directionId = directionIdLib.convertRealtimeApiForRoutingApi(realtimeApiDirectionId);
        const routePatternId = await searchRoutePatternIdByTripDetails(routeId, directionId, departureDate, departureTime);
        const routePattern = routePatternId ? await findRoutePatternById(routePatternId) : null;

        if (routePattern) {
            const stop = await findStopByPositionForRoutePattern(latitude, longitude, { routePatternId: routePattern.id });

            if (stop) {
                const trip = await findTripByDeparture(routePattern.id, departureDate, departureTime)
                    || await createTrip(routePattern.id, departureDate, departureTime);

                await addTripStop(trip.id, stop.id, seenAtStop, hasDoorsOpen);
            }
        }
    }
}());
