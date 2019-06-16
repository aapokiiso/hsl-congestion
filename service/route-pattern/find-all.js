'use strict';

const initDb = require('../../db');

module.exports = async function findAllRoutePatterns() {
    const db = await initDb();

    const routePatterns = await db.models.RoutePattern.findAll();

    return routePatterns
        .map(routePattern => routePattern.get({ plain: true }));
};
