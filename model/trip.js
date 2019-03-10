'use strict';

const queryGraphql = require('../includes/query-graphql');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
    const Trip = sequelize.define('Trip', {
        departureDate: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        departureTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['routePatternId', 'departureDate', 'departureTime'],
            },
        ],
    });

    const RoutePattern = sequelize.models.RoutePattern || require('./route-pattern')(sequelize, DataTypes);
    Trip.belongsTo(RoutePattern, { as: 'routePattern' });

    const routePatternIdCache = {};

    Trip.searchRoutePatternIdFromApi = async function (routeId, directionId, departureDate, departureTime) {
        const routeGtfsId = sequelize.models.Route.getGtfsId(routeId);
        const departureTimeSeconds = Trip.getDepartureTimeInSeconds(departureTime);

        const cacheKey = [routeGtfsId, directionId, departureDate, departureTimeSeconds].join('-');
        if (routePatternIdCache[cacheKey]) {
            return routePatternIdCache[cacheKey];
        }

        const { fuzzyTrip: trip } = await queryGraphql(`{
            fuzzyTrip(route: "${routeGtfsId}", direction: ${directionId}, date: "${departureDate}", time: ${departureTimeSeconds}) {
                pattern {
                    code
                }
            }
        }`);

        if (!trip) {
            throw new Error(`Trip details not found for route ID ${routeGtfsId}, direction ${directionId}, departure date ${departureDate}, departure time ${departureTime}`);
        }

        const { code: routePatternId } = trip.pattern;

        routePatternIdCache[cacheKey] = routePatternId;

        return routePatternId;
    };

    Trip.findTripsFromLastDay = function (routePatternId) {
        return Trip.findAll({
            where: {
                routePatternId,
                [sequelize.Op.or]: [
                    {
                        departureDate: moment().subtract(1, 'days')
                            .format('YYYY-MM-DD'),
                    },
                    {
                        departureDate: moment().format('YYYY-MM-DD'),
                    },
                ],
            },
        });
    };

    Trip.getDepartureTimeInSeconds = function (departureTime) {
        const [hours, minutes] = departureTime.split(':');

        const minutesInHour = 60;
        const secondsInMinute = 60;

        return hours * minutesInHour * secondsInMinute + minutes * secondsInMinute;
    };

    return Trip;
};
