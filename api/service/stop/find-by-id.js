'use strict';

const initOrm = require('../../orm');

module.exports = async function findById(stopId) {
    const orm = await initOrm();

    const stop = await orm.models.Stop.findByPk(stopId);

    return stop ? stop.get({ plain: true }) : null;
};
