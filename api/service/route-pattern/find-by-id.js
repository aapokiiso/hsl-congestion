'use strict';

const initOrm = require('../../orm');
const importRoutePattern = require('./import-by-id');

module.exports = async function findRoutePattern(routePatternId) {
    const existingPattern = await findFromDb(routePatternId);

    return existingPattern || importRoutePattern(routePatternId);
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
