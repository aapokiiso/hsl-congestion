'use strict';

const mqtt = require('mqtt');
const config = require('../config');
const sequelize = require('../sequelize');

const routeId = {};

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
            return VehiclePosition.create({
                routeId,
                vehicleId,
                direction,
                latitude,
                longitude,
                speed,
                timestamp
            });
        })
        .catch(err => err && err.message ? console.error(err.message) : console.error(err));
}

function getRouteId(models, routeName) {
    if (routeId[routeName]) {
        return Promise.resolve(routeId[routeName]);
    }

    return models.Route.findOne({where: {name: routeName}})
        .then(route => {
            if (!route) {
                throw {message: `Route ${routeName} not found.`};
            }

            routeId[routeName] = route.get('id');

            return routeId[routeName];
        });
}
