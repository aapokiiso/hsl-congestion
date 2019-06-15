'use strict';

const initOrm = require('../../orm');

module.exports = async function findAllRoutePatterns() {
    const orm = await initOrm();

    const routePatterns = await orm.models.RoutePattern.findAll();

    return routePatterns
        .map(routePattern => routePattern.get({ plain: true }));
};
