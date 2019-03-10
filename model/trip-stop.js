'use strict';

module.exports = function (sequelize, DataTypes) {
    const TripStop = sequelize.define('TripStop', {
        seenAtStop: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'UNIX timestamp',
        },
    }, {
        timestamps: false,
    });

    const Trip = sequelize.models.Trip || require('./trip')(sequelize, DataTypes);
    TripStop.belongsTo(Trip, { as: 'trip' });

    const Stop = sequelize.models.Stop || require('./stop')(sequelize, DataTypes);
    TripStop.belongsTo(Stop, { as: 'stop' });

    /**
     * Upper ceiling for stop congestion.
     * Anything over this is classified as maximum congestion!
     *
     * @type {number}
     */
    TripStop.THEORETICAL_MAX_STOP_SECONDS = 30;

    TripStop.hasTripPassedStop = async function (trip, stop) {
        const lastSeenAtStop = await TripStop.findOne({
            where: {
                tripId: trip.get('id'),
                stopId: stop.get('id'),
            },
            order: [
                ['seenAtStop', 'DESC'],
            ],
        });

        return lastSeenAtStop
            ? TripStop.findOne({
                where: {
                    tripId: trip.get('id'),
                    seenAtStop: {
                        [sequelize.Op.gt]: lastSeenAtStop.get('seenAtStop'),
                    },
                },
            })
            : false;
    };

    TripStop.findTripPassedStops = async function (trip) {
        const tripStopsBeenTo = await TripStop.findAll({
            attributes: [
                'stopId',
                [sequelize.fn('MAX', sequelize.col('seenAtStop')), 'lastSeenAtStop'],
            ],
            where: {
                tripId: trip.get('id'),
            },
            order: [
                [sequelize.fn('MAX', sequelize.col('seenAtStop')), 'DESC'],
            ],
            group: ['stopId'],
        });

        // Assume that latest stop hasn't been passed yet.
        const tripStopsPassed = tripStopsBeenTo.slice(0, -1);
        const passedStopIds = tripStopsPassed.map(tripStop => tripStop.get('stopId'));

        return Stop.findAll({
            where: {
                id: {
                    [sequelize.Op.in]: passedStopIds,
                },
            },
        });
    };

    TripStop.getTripDurationAtStop = async function (trip, stop) {
        const timestamps = await TripStop.findAll({
            where: {
                tripId: trip.get('id'),
                stopId: stop.get('id'),
            },
            order: [
                ['seenAtStop', 'ASC'],
            ],
        });

        if (timestamps.length === 0) {
            // Trip has not been on stop, or passed it directly.
            return 0;
        }

        const [firstSeen] = timestamps;
        const [lastSeen] = timestamps.reverse();

        return lastSeen.get('seenAtStop') - firstSeen.get('seenAtStop');
    };

    TripStop.getCongestionRate = function (stopDurations) {
        const durationsWithWeights = stopDurations
            .map((duration, idx, arr) => [duration, 1 / (arr.length - idx)]);

        const weightedMaxDuration = durationsWithWeights
            .reduce((acc, val) => {
                const [, weight] = val;

                return acc + TripStop.THEORETICAL_MAX_STOP_SECONDS * weight;
            }, 0);

        const weightedDuration = durationsWithWeights
            .reduce((acc, val) => {
                const [duration, weight] = val;

                return acc + duration * weight;
            }, 0);

        return weightedDuration && weightedMaxDuration
            ? weightedDuration / weightedMaxDuration
            : 0;
    };

    return TripStop;
};
