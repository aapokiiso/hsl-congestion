'use strict';

const mqtt = require('mqtt');
const config = require('../config');
const sequelize = require('../sequelize');

const routeIds = {};

sequelize.init()
    .then(initMqtt);
    
function initMqtt(seq) {
    const client = mqtt
        .connect({
            host: config.mqtt.host, 
            port: config.mqtt.port
        })
        .subscribe(config.mqtt.topic);

    // Start listening for vehicle position updates
    client.on('message', (topic, message) => {
        let json;
        try {
            json = JSON.parse(message.toString());
        } catch (e) {
            json = {};
        }

        json = json['VP'] ? json['VP'] : json; // Remove extra layer from object

        saveVehiclePosition(seq.models, json);
    });
}

function saveVehiclePosition(models, {
    desi: routeName,
    veh: vehicleId, 
    dir: direction, 
    lat: latitude, 
    long: longitude, 
    spd: speed, 
    tsi: timestamp
}) {
    return getRouteId(models, routeName)
        .then(routeId => {
            return models.VehiclePosition.create({
                routeId,
                vehicleId,
                direction,
                latitude,
                longitude,
                speed,
                timestamp
            });
        })
        .catch(err => console.error(`Error: ${err.message}`, err.stack));
}

function getRouteId(models, routeName) {
    if (routeIds[routeName]) {
        return Promise.resolve(routeIds[routeName]);
    }

    return models.Route.findOne({where: {name: routeName}})
        .then(route => {
            if (!route) {
                throw new Error(`Route '${routeName}' not found.`);
            }

            routeIds[routeName] = route.get('id');

            return routeIds[routeName];
        });
}
