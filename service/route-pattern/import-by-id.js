'use strict';

const initDb = require('../../db');
const queryGraphQL = require('../../include/query-graphql');
const findRoute = require('./../route/find-by-id');
const importStops = require('../stop/import-for-route-pattern');

module.exports = async function importRoutePattern(routePatternId) {
    const patternData = await findDataFromApi(routePatternId);

    const { route: routeData } = patternData;
    const { id: routeId } = await findRoute(routeData.gtfsId);

    const { directionId, headsign } = patternData;

    const pattern = await createRoutePatternToDb(routePatternId, routeId, directionId, headsign);

    await importStops(routePatternId);

    return pattern;
};

async function findDataFromApi(routePatternId) {
    const { pattern } = await queryGraphQL(`{
            pattern(id: "${routePatternId}") {
                directionId
                headsign
                route {
                    gtfsId
                }
            }
        }`);

    return pattern;
}

async function createRoutePatternToDb(routePatternId, routeId, directionId, headsign) {
    const db = await initDb();

    const pattern = await db.models.RoutePattern.create({
        id: routePatternId,
        routeId,
        direction: directionId,
        headsign,
    });

    return pattern.get({ plain: true });
}
