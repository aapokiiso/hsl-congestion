'use strict';

const geolib = require('geolib');
const sequelize = require('../sequelize');

const stopRange = 5; // in meters

sequelize.init()
    .then(seq => Promise.all([
        seq.models.VehiclePosition.findAll(),
        seq.models.Stop.findAll()
    ]))
    .then(function ([positions, stops]) {
        const vehicleIds = positions
            .map(pos => pos.get('vehicleId'))
            .filter((vehicleId, i, arr) => arr.indexOf(vehicleId) === i);

        vehicleIds.forEach(function (vehicleId) {
            const vehiclePositions = positions
                .filter(pos => pos.get('vehicleId') == vehicleId);

            const stopPositions = vehiclePositions.reduce((acc, val) => {
                const posCoords = {
                    latitude: val.get('latitude'), 
                    longitude: val.get('longitude')
                };

                const closestStop = stops.sort((a, b) => {
                    const distA = geolib.getDistance(posCoords, {latitude: a.get('latitude'), longitude: a.get('longitude')});
                    const distB = geolib.getDistance(posCoords, {latitude: b.get('latitude'), longitude: b.get('longitude')});

                    return distA <= distB ? -1 : 1;
                })[0];

                const stopCoords = {
                    latitude: closestStop.get('latitude'), 
                    longitude: closestStop.get('longitude')
                };

                if (geolib.getDistance(posCoords, stopCoords) < stopRange) {
                    if (!acc[closestStop.get('id')]) {
                        acc[closestStop.get('id')] = [];
                    }

                    acc[closestStop.get('id')].push(val);
                }

                return acc;
            }, {});

            const stopTimes = {};
            for (let stopId in stopPositions) {
                if (!stopPositions.hasOwnProperty(stopId)) {
                    continue;
                }

                const sortedPositions = stopPositions[stopId]
                    .sort((a, b) => a.get('timestamp') <= b.get('timestamp') ? -1 : 1);

                stopTimes[stopId] = sortedPositions[sortedPositions.length - 1].get('timestamp') - sortedPositions[0].get('timestamp');
            }

            console.log(stopTimes);
        });
    })
    .catch(err => console.error(err));

