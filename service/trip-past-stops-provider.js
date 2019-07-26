'use strict';

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

const Sequelize = require('sequelize');
const initDb = require('../db');

module.exports = {
    /**
     * @param {String} tripId
     * @returns {Promise<Array<Object>>}
     */
    async getList(tripId) {
        const db = await initDb();

        const tripStopsBeenTo = await db.models.TripStop.findAll({
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

        const stops = await db.models.Stop.findAll({
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
    }
};
