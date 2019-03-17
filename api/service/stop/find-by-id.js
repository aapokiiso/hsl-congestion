'use strict';

const initOrm = require('../../orm');

module.exports = async function findById(stopId) {
    const orm = await initOrm();

    return orm.models.Stop.findByPk(stopId);

    // @todo should this import?
};
