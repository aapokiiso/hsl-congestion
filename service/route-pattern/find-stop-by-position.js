'use strict';

const geolib = require('geolib');
const initOrm = require('../../orm');
const appConfig = require('../../config');

module.exports = async function findStopByPositionForRoutePattern(routePatternId, vehicleLatitude, vehicleLongitude) {
    if (!isValidCoordinates(vehicleLatitude, vehicleLongitude)) {
        return [];
    }

    const orm = await initOrm();

    const stops = await orm.models.Stop
        .findAll({
            where: {
                routePatternId,
            },
        });

    return stops
        .map(stop => stop.get({ plain: true }))
        .find(function isVehicleNearStop(stop) {
            return geolib.isPointInCircle(
                { latitude: vehicleLatitude, longitude: vehicleLongitude },
                { latitude: stop.latitude, longitude: stop.longitude },
                appConfig.hsl.stopRadiusMeters
            );
        });
};

function isValidCoordinates(lat, lon) {
    const maxLat = 90;
    const maxLon = 180;

    return typeof lat === 'number' && typeof lon === 'number'
        && -maxLat < lat < maxLat
        && -maxLon <= lon <= maxLon;
}
