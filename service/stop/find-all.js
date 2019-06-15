'use strict';

const initOrm = require('../../orm');

module.exports = async function findAllStops() {
    const orm = await initOrm();

    const stops = await orm.models.Stop.findAll();

    return stops
        .map(stop => stop.get({ plain: true }));
};
