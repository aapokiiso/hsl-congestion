'use strict';

const initOrm = require('../../orm');
const importRoute = require('./import-by-id');

module.exports = async function findRoute(routeId) {
    const existingRoute = await findFromDb(routeId);

    return existingRoute || importRoute(routeId);
};

async function findFromDb(routeId) {
    const orm = await initOrm();

    return orm.models.Route.findByPk(
        routeId,
        {
            plain: true,
        }
    );
}
