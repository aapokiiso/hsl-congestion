'use strict';

const initDb = require('../../db');
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

    const db = await initDb();

    const route = await db.models.Route.create({
        id: routeId,
        mode,
        name,
    });

    return route.get({ plain: true });
}
