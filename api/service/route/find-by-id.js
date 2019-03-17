'use strict';

const initOrm = require('../../orm');
const importRoute = require('./import-by-id');

module.exports = function findRoute(routeId) {
    return findFromDb(routeId) || importRoute(routeId);
};

function findFromDb(routeId) {
    return orm.models.Route.findByPk(
        routeId,
        {
            plain: true,
        }
    );
}
