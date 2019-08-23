#!/usr/bin/env node

/**
 * Script for logging vehicle load durations at stops into a database,
 * listening to the HSL High-Frequence Positioning API (v2).
 */

'use strict';

const mqtt = require('mqtt');
const moment = require('moment-timezone');
const hslUtils = require('@aapokiiso/hsl-congestion-utils');
const appConfig = require('../config');
const routePatternIdResolver = require('../service/route-pattern-id-resolver');
const routePatternRepository = require('../service/route-pattern-repository');
const stopRepository = require('../service/stop-repository');
const tripIdResolver = require('../service/trip-id-resolver');
const tripRepository = require('../service/trip-repository');
const tripStopRecorder = require('../service/trip-stop-recorder');

const mqttClient = initMqtt(appConfig.mqtt.topics);

mqttClient.on('message', async (topic, message) => {
    const { eventType, routeId, nextStopId } = parseTopic(topic);

    if (hslUtils.nextStopId.isEndOfLine(nextStopId)) {
        return;
    }

    let eventPayload;
    try {
        eventPayload = parseMessage(message, eventType);
    } catch (e) {
        console.error('Failed to parse vehicle position payload. Reason:', e, messageStr);

        return;
    }

    let routePatternId;
    try {
        routePatternId = await findRoutePatternId(routeId, eventPayload);
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
        tripId = await findTripId(routeId, eventPayload);
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

    await recordTripStop(trip, stop, eventPayload);
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
    const [, , , , , eventType, , , , routeId, , , , nextStopId] = topic.split('/');

    return {
        eventType,
        routeId,
        nextStopId,
    };
}

function parseMessage(message, eventType) {
    const fullPayload = JSON.parse(message.toString());

    return fullPayload[eventType.toUpperCase()] || {};
}

function findRoutePatternId(routeId, {
    dir: realtimeApiDirectionId,
    tst: seenAtStop,
    oday: departureDate,
    start: departureTime,
}) {
    const directionId = hslUtils.directionId.convertRealtimeApiForRoutingApi(realtimeApiDirectionId);
    const departureTimeSeconds = hslUtils.departureTime.convertToSeconds(
        departureTime,
        hslUtils.departureTime.shouldRollOverToNextDay(departureDate, seenAtStop)
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
    const stopId = hslUtils.nextStopId.convertRealtimeApiForRoutingApi(realtimeApiStopId);

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
    const directionId = hslUtils.directionId.convertRealtimeApiForRoutingApi(realtimeApiDirectionId);
    const departureTimeSeconds = hslUtils.departureTime.convertToSeconds(
        departureTime,
        hslUtils.departureTime.shouldRollOverToNextDay(departureDate, seenAtStop)
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
