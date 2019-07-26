'use strict';

const mqtt = require('mqtt');
const moment = require('moment-timezone');
const appConfig = require('../config');
const directionIdLib = require('../include/direction-id');
const departureTimeLib = require('../include/departure-time');
const nextStopIdLib = require('../include/next-stop-id');
const routePatternIdResolver = require('../service/route-pattern-id-resolver');
const routePatternRepository = require('../service/route-pattern-repository');
const stopRepository = require('../service/stop-repository');
const tripIdResolver = require('../service/trip-id-resolver');
const tripRepository = require('../service/trip-repository');
const tripStopRecorder = require('../service/trip-stop-recorder');

(function IIFE() {
    const mqttClient = initMqtt(appConfig.mqtt.topics);

    mqttClient.on('message', async (topic, message) => {
        const messageStr = message.toString();
        const { routeId, nextStopId } = parseTopic(topic);

        if (nextStopIdLib.isEndOfLine(nextStopId)) {
            return;
        }

        let vehiclePosition;
        try {
            const { VP } = JSON.parse(messageStr);

            vehiclePosition = VP;
        } catch (e) {
            console.error('Failed to parse vehicle position payload. Reason:', e, messageStr);

            return;
        }

        let routePatternId;
        try {
            routePatternId = await findRoutePatternId(routeId, vehiclePosition);
        } catch (e) {
            console.error('Failed to find vehicle position route pattern ID. Reason:', e);

            return;
        }

        let routePattern;
        try {
            routePattern = await getOrCreateRoutePatternById(routePatternId);
        } catch (e) {
            console.error('Failed to get or create route pattern to database. Reason:', e);

            return;
        }

        let stop;
        try {
            stop = await getOrCreateStopById(nextStopId);
            const stopAlreadyAssociated = await routePattern.hasStop(stop);
            if (!stopAlreadyAssociated) {
                await stopRepository.associateToRoutePattern(stop.id, routePattern.id);
            }
        } catch (e) {
            console.error('Failed to get or create next stop to database. Reason:', e);

            return;
        }

        let tripId;
        try {
            tripId = await findTripId(routeId, vehiclePosition);
        } catch (e) {
            console.error('Failed to find vehicle position trip ID. Reason:', e);

            return;
        }

        let trip;
        try {
            trip = await getOrCreateTripById(tripId);
        } catch (e) {
            console.error('Failed to get or create trip to database. Reason:', e);

            return;
        }

        await recordTripStop(trip, stop, vehiclePosition);
    });

    function initMqtt(topics) {
        return mqtt
            .connect({
                host: appConfig.mqtt.host,
                port: appConfig.mqtt.port,
            })
            .subscribe(topics);
    }

    function parseTopic(topic) {
        const [, , , , , , , , routeId, , , , nextStopId] = topic.split('/');

        return {
            routeId,
            nextStopId,
        };
    }

    function findRoutePatternId(routeId, {
        dir: realtimeApiDirectionId,
        tst: seenAtStop,
        oday: departureDate,
        start: departureTime,
    }) {
        const directionId = directionIdLib.convertRealtimeApiForRoutingApi(realtimeApiDirectionId);
        const departureTimeSeconds = departureTimeLib.convertToSeconds(
            departureTime,
            departureTimeLib.shouldRollOverToNextDay(departureDate, seenAtStop)
        );

        return routePatternIdResolver.findIdByDeparture(routeId, directionId, departureDate, departureTimeSeconds);
    }

    async function getOrCreateRoutePatternById(routePatternId) {
        try {
            return await routePatternRepository.getById(routePatternId);
        } catch (e) {
            return routePatternRepository.createById(routePatternId);
        }
    }

    async function getOrCreateStopById(realtimeApiStopId) {
        const stopId = nextStopIdLib.convertRealtimeApiForRoutingApi(realtimeApiStopId);

        try {
            return await stopRepository.getById(stopId);
        } catch (e) {
            return stopRepository.createById(stopId);
        }
    }

    function findTripId(routeId, {
        dir: realtimeApiDirectionId,
        tst: seenAtStop,
        oday: departureDate,
        start: departureTime,
    }) {
        const directionId = directionIdLib.convertRealtimeApiForRoutingApi(realtimeApiDirectionId);
        const departureTimeSeconds = departureTimeLib.convertToSeconds(
            departureTime,
            departureTimeLib.shouldRollOverToNextDay(departureDate, seenAtStop)
        );

        return tripIdResolver.findIdByDeparture(routeId, directionId, departureDate, departureTimeSeconds);
    }

    async function getOrCreateTripById(tripId) {
        try {
            return await tripRepository.getById(tripId);
        } catch (e) {
            return tripRepository.createById(tripId);
        }
    }

    function recordTripStop(trip, stop, {
        tst: seenAtStop,
        drst: hasDoorsOpen,
    }) {
        return tripStopRecorder.recordTripStop(
            trip.id,
            stop.id,
            moment(seenAtStop).toDate(),
            Boolean(hasDoorsOpen)
        );
    }

    function logError(e) {
        if (e instanceof ValidationError) {

        }
    }
}());
