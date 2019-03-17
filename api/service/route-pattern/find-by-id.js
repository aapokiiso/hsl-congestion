'use strict';

const initOrm = require('../../orm');
const importRoutePattern = require('./import-by-id');

module.exports = async function findRoutePattern(routePatternId) {
    const existingPattern = await findFromDb(routePatternId);

    return existingPattern || importRoutePattern(routePatternId);
};

async function findFromDb(routePatternId) {
    const orm = await initOrm();

    const pattern = orm.models.RoutePattern.findByPk(routePatternId);

    return pattern ? pattern.get({plain: true}) : null;
}
