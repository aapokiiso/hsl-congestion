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
            await saveVehiclePosition(routeId, vehiclePosition);
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

    async function saveVehiclePosition(routeId, {
        jrn: journeyId,
        dir: realtimeApiDirectionId,
        lat: latitude,
        long: longitude,
        tsi: timestamp,
        oday: departureDate,
        start: departureTime,
    }) {
        const { RoutePattern, Trip, VehiclePosition } = dbInstance.models;

        const directionId = RoutePattern.getRoutingApiDirectionId(realtimeApiDirectionId);
        const routePatternId = await Trip.searchRoutePatternIdFromApi(routeId, directionId, departureDate, departureTime);

        const routePattern = await RoutePattern.findOrCreateFromApi(routePatternId);

        const [trip] = await Trip.findOrCreate({
            where: {
                id: journeyId,
                routePatternId: routePattern.get('id'),
                departureDate,
                departureTime,
            },
        });

        return VehiclePosition.create({
            tripId: trip.get('id'),
            latitude,
            longitude,
            timestamp,
        });
    }
}());
