'use strict';

const hslGraphQL = require('@aapokiiso/hsl-congestion-graphql-gateway');
const db = require('../db');
const NoSuchEntityError = require('../error/no-such-entity');
const CouldNotSaveError = require('../error/could-not-save');

module.exports = {
    /**
     * @param {string} routeId
     * @returns {Promise<object>}
     * @throws NoSuchEntityError
     */
    async getById(routeId) {
        const route = await db.models.Route.findByPk(routeId);

        if (!route) {
            throw new NoSuchEntityError(
                `Could not find route with ID '${routeId}'`
            );
        }

        return route;
    },
    /**
     * Imports route from HSL API into the database.
     *
     * @param {string} routeId
     * @returns {Promise<object>}
     * @throws CouldNotSaveError
     */
    async createById(routeId) {
        try {
            const routeData = await findDataFromApi(routeId);

            return await createRouteToDb(routeId, routeData);
        } catch (e) {
            throw new CouldNotSaveError(
                `Could not save route with ID '${routeId}'. Reason: ${e.message}`
            );
        }
    },
};

async function findDataFromApi(routeId) {
    const { route } = await hslGraphQL.query(
        `{
            route(id: "${routeId}") {
                mode
                shortName
            }
        }`,
        {
            priority: hslGraphQL.requestPriority.high,
        }
    );

    return route;
}

async function createRouteToDb(routeId, routeData) {
    const { mode, shortName: name } = routeData;

    const [route] = await db.models.Route.findOrCreate({
        where: {
            id: routeId,
            mode,
            name,
        },
    });

    return route;
}
