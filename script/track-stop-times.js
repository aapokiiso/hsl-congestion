'use strict';

const mqtt = require('mqtt');
const appConfig = require('../config');
const db = require('../db');

(async function IIFE() {
    const dbInstance = await db.init();
    const mqttClient = initMqtt([
        '/hfp/v1/journey/ongoing/tram/+/+/1007/#',
        '/hfp/v1/journey/ongoing/tram/+/+/1007H/#',
    ]);

    mqttClient.on('message', async (topic, message) => {
        const messageStr = message.toString();
        const routeId = parseRouteIdFromTopic(topic);

        try {
            const { VP: vehiclePosition } = JSON.parse(messageStr);
            if (isVehicleAtStop(vehiclePosition)) {
                await saveVehicleStopTime(routeId, vehiclePosition);
            }
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

    function isVehicleAtStop({ drst: hasDoorsOpen }) {
        return hasDoorsOpen;
    }

    async function saveVehicleStopTime(routeId, {
        dir: realtimeApiDirectionId,
        lat: latitude,
        long: longitude,
        tsi: timestamp,
        oday: departureDate,
        start: departureTime,
    }) {
        const { RoutePattern, Trip, Stop, TripStop } = dbInstance.models;

        const directionId = RoutePattern.getRoutingApiDirectionId(realtimeApiDirectionId);
        const routePatternId = await Trip.searchRoutePatternIdFromApi(routeId, directionId, departureDate, departureTime);

        const routePattern = await RoutePattern.findOrCreateFromApi(routePatternId);

        const [trip] = await Trip.findOrCreate({
            where: {
                routePatternId: routePattern.get('id'),
                departureDate,
                departureTime,
            },
        });

        const stop = await Stop.findByPosition(routePattern.get('id'), latitude, longitude);

        if (trip && stop) {
            await TripStop.create({
                tripId: trip.get('id'),
                stopId: stop.get('id'),
                seenAtStop: timestamp,
            });
        }
    }
}());
