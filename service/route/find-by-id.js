'use strict';

const initDb = require('../../db');
const importRoute = require('./import-by-id');

module.exports = async function findRoute(routeId) {
    const existingRoute = await findFromDb(routeId);

    return existingRoute || importRoute(routeId);
};

async function findFromDb(routeId) {
    const db = await initDb();

    const route = await db.models.Route.findByPk(routeId);

    return route ? route.get({ plain: true }) : null;
}
