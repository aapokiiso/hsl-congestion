'use strict';

const Sequelize = require('sequelize');
const { db } = require('@aapokiiso/hsl-congestion-db-schema');

module.exports = {
    /**
     * @param {String} tripId
     * @returns {Promise<Array<Object>>}
     */
    async getList(tripId) {
        const tripStopsBeenTo = await db().models.TripStop.findAll({
            attributes: [
                'stopId',
                [Sequelize.fn('MAX', Sequelize.col('seenAtStop')), 'lastSeenAtStop'],
            ],
            where: {
                tripId,
            },
            order: [
                [Sequelize.fn('MAX', Sequelize.col('seenAtStop')), 'DESC'],
            ],
            group: ['stopId'],
        });

        const stopIdsBeenTo = tripStopsBeenTo.map(tripStop => tripStop.stopId);

        const stops = await db().models.Stop.findAll({
            where: {
                id: {
                    [Sequelize.Op.in]: stopIdsBeenTo,
                },
            },
        });

        return stops
            .sort(function sortStopsFromFirstToLast(stopA, stopB) {
                return stopIdsBeenTo.indexOf(stopB.id) - stopIdsBeenTo.indexOf(stopA.id);
            });
    },
};
