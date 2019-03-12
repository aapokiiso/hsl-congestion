'use strict';

const initOrm = require('../../orm');
const queryGraphQL = require('../../include/query-graphql');

module.exports = async function importRoute(routeId) {
    const routeData = await findDataFromApi(routeId);

    return createRouteToDb(routeId, routeData);
};

async function findDataFromApi(routeId) {
    const { route } = await queryGraphQL(`{
            route(id: "${routeId}") {
                mode
                shortName
            }
        }`);

    return route;
}

async function createRouteToDb(routeId, routeData) {
    const { mode, shortName: name } = routeData;

    const orm = await initOrm();

    const route = await orm.models.Route.create({
        id: routeId,
        mode,
        name,
    });

    return route.get({ plain: true });
}
