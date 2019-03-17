'use strict';

const initOrm = require('../../orm');
const importRoute = require('./import-by-id');

module.exports = async function findRoute(routeId) {
    const existingRoute = await findFromDb(routeId);

    return existingRoute || importRoute(routeId);
};

async function findFromDb(routeId) {
    const orm = await initOrm();

    const route = await orm.models.Route.findByPk(routeId);

    return route ? route.get({plain: true}) : null;
}
