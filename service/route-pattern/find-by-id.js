'use strict';

const initDb = require('../../db');
const importRoutePattern = require('./import-by-id');

module.exports = async function findRoutePattern(routePatternId) {
    const existingPattern = await findFromDb(routePatternId);

    return existingPattern || importRoutePattern(routePatternId);
};

async function findFromDb(routePatternId) {
    const db = await initDb();

    const pattern = await db.models.RoutePattern.findByPk(routePatternId);

    return pattern ? pattern.get({ plain: true }) : null;
}
