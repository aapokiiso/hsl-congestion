'use strict';

const Sequelize = require('sequelize');
const initOrm = require('../../orm');

module.exports = async function findStopsBeenTo(tripId) {
    const orm = await initOrm();

    const tripStopsBeenTo = await orm.models.TripStop.findAll({
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

    const stopIdsBeenTo = tripStopsBeenTo.map(tripStop => tripStop.get('stopId'));

    const stops = await orm.models.Stop.findAll({
        where: {
            id: {
                [Sequelize.Op.in]: stopIdsBeenTo,
            },
        },
    });

    return stops
        .map(stop => stop.get({ plain: true }))
        .sort(function sortStopsFromFirstToLast(stopA, stopB) {
            return stopIdsBeenTo.indexOf(stopB.id) - stopIdsBeenTo.indexOf(stopA.id);
        });
};
