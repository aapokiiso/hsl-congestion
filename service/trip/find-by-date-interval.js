'use strict';

const Sequelize = require('sequelize');
const moment = require('moment-timezone');
const initOrm = require('../../orm');

module.exports = async function findTripsByDateInterval(routePatternId, offsetDate, limitDate = null) {
    const orm = await initOrm();

    const trips = await orm.models.Trip
        .findAll({
            where: {
                routePatternId,
                departureTime: getSearchInterval(offsetDate, limitDate),
            },
            order: [
                ['departureTime', 'DESC'],
            ],
        });

    return trips.map(trip => trip.get({ plain: true }));
};

function getSearchInterval(offsetDate, limitDate) {
    if (limitDate) {
        return {
            [Sequelize.Op.between]: [
                moment(limitDate)
                    .startOf('day')
                    .toDate(),
                moment(offsetDate)
                    .endOf('day')
                    .toDate(),
            ],
        };
    }

    return {
        [Sequelize.Op.lte]: moment(offsetDate)
            .endOf('day')
            .toDate(),
    };
}
