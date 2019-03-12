'use strict';

const Sequelize = require('sequelize');
const initOrm = require('../../orm');
const sortByIndex = require('../../include/sort-by-index');

module.exports = async function findTripPassedStops(tripId) {
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
    // Assume that latest stop hasn't been passed yet.
    const stopIdsPassed = stopIdsBeenTo.slice(0, -1);

    const stops = await orm.models.Stop.findAll({
        where: {
            id: {
                [Sequelize.Op.in]: stopIdsPassed,
            },
        },
    });

    return stops
        .map(stop => stop.get({ plain: true }))
        .sort(sortByIndex(stopIdsPassed));
};
