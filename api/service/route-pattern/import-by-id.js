'use strict';

const initOrm = require('../../orm');
const queryGraphQL = require('../../include/query-graphql');
const findRoute = require('./../route/find-by-id');
const importStops = require('../stop/import-for-route-pattern');

module.exports = async function importRoutePattern(routePatternId) {
    const patternData = await findDataFromApi(routePatternId);

    const { route: routeData } = patternData;
    const { id: routeId } = await findRoute(routeData.gtfsId);

    const { directionId } = patternData;

    const pattern = await createRoutePatternToDb(routePatternId, routeId, directionId);

    await importStops(routePatternId);

    return pattern;
};

async function findDataFromApi(routePatternId) {
    const { pattern } = await queryGraphQL(`{
            pattern(id: "${routePatternId}") {
                directionId
                route {
                    gtfsId
                }
            }
        }`);

    return pattern;
}

async function createRoutePatternToDb(routePatternId, routeId, directionId) {
    const orm = await initOrm();

    const pattern = await orm.models.RoutePattern.create({
        id: routePatternId,
        routeId,
        direction: directionId,
    });

    return pattern.get({ plain: true });
}
