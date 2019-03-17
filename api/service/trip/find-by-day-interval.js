'use strict';

const Sequelize = require('sequelize');
const moment = require('moment');
const initOrm = require('../../orm');

module.exports = async function findTripsByDayInterval(routePatternId, daysInPast = 1) {
    const orm = await initOrm();

    const trips = await orm.models.Trip
        .findAll({
            where: {
                routePatternId,
                [Sequelize.Op.or]: [
                    {
                        departureDate: moment()
                            .subtract(daysInPast, 'days')
                            .format('YYYY-MM-DD'),
                    },
                    {
                        departureDate: moment()
                            .format('YYYY-MM-DD'),
                    },
                ],
            },
            order: [
                ['createdAt', 'DESC'],
            ],
        });

    return trips.map(trip => trip.get({ plain: true }));
};
