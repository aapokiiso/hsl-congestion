'use strict';

const initOrm = require('../../orm');
const queryGraphQL = require('../../include/query-graphql');

module.exports = async function importStopsForRoutePattern(routePatternId) {
    const stopsData = await findStopsDataFromApi(routePatternId);

    return Promise.all(
        stopsData.map(stopData => createStopToDb(routePatternId, stopData))
    );
};

async function findStopsDataFromApi(routePatternId) {
    const { pattern } = await queryGraphQL(`{
            pattern(id: "${routePatternId}") {
                stops {
                    gtfsId
                    name
                    lat
                    lon
                }
            }
        }`);

    const { stops } = pattern;

    return stops;
}

async function createStopToDb(routePatternId, stopData) {
    const {
        gtfsId: stopId,
        name,
        lat: latitude,
        lon: longitude,
    } = stopData;

    const orm = await initOrm();

    const stop = await orm.models.Stop.create({
        id: stopId,
        routePatternId,
        name,
        latitude,
        longitude,
    });

    return stop.get({ plain: true });
}
