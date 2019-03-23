'use strict';

const Sequelize = require('sequelize');
const moment = require('moment-timezone');
const initOrm = require('../../orm');

module.exports = async function findTripsByDayInterval(routePatternId, referenceDay = 0, daysInPast = 0) {
    const orm = await initOrm();

    const trips = await orm.models.Trip
        .findAll({
            where: {
                routePatternId,
                departureTime: getSearchInterval(referenceDay, daysInPast),
            },
            order: [
                ['departureTime', 'DESC'],
            ],
        });

    return trips.map(trip => trip.get({ plain: true }));
};

function getSearchInterval(referenceDay, daysInPast) {
    const hasLimit = daysInPast > 0;

    return hasLimit
        ? {
            [Sequelize.Op.between]: [
                moment()
                    .subtract(daysInPast, 'days')
                    .startOf('day')
                    .toDate(),
                moment()
                    .subtract(referenceDay, 'days')
                    .endOf('day')
                    .toDate(),
            ],
        }
        : {
            [Sequelize.Op.lte]: moment()
                .subtract(referenceDay, 'days')
                .endOf('day')
                .toDate(),
        };
}
