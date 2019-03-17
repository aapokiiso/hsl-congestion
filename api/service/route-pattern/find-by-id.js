'use strict';

const initOrm = require('../../orm');
const importRoutePattern = require('./import-by-id');

module.exports = function findRoutePattern(routePatternId) {
    return findFromDb(routePatternId) || importRoutePattern(routePatternId);
};

async function findFromDb(routePatternId) {
    const orm = await initOrm();

    return orm.models.RoutePattern.findByPk(
        routePatternId,
        {
            plain: true,
        }
    );
}
