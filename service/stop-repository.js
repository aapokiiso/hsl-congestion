'use strict';

const Sequelize = require('sequelize');
const initDb = require('../db');
const hslGraphQL = require('../include/hsl-graphql');
const NoSuchEntityError = require('../error/no-such-entity');
const CouldNotSaveError = require('../error/could-not-save');

module.exports = {
    async getList() {
        const db = await initDb();

        const stops = await db.models.Stop.findAll();

        return stops;
    },
    async getListByIds(stopIds) {
        const db = await initDb();

        const stops = await db.models.Stop.findAll({
            where: {
                id: {
                    [Sequelize.Op.in]: stopIds,
                },
            },
        });

        return stops;
    },
    /**
     * @param {string} stopId
     * @returns {Promise<object>}
     * @throws NoSuchEntityError
     */
    async getById(stopId) {
        const db = await initDb();

        const stop = await db.models.Stop.findByPk(stopId);

        if (!stop) {
            throw new NoSuchEntityError(
                `No stop found with ID '${stopId}'`
            );
        }

        return stop;
    },
    async createById(stopId) {
        try {
            const stopData = await findDataFromApi(stopId);

            return await createStopToDb(stopId, stopData);
        } catch (e) {
            throw new CouldNotSaveError(
                `Could not save stop with ID '${stopId}'. Reason: ${e.message}`
            );
        }
    },
    async associateToRoutePattern(stopId, routePatternId) {
        const db = await initDb();

        const [stop, routePattern] = await Promise.all([
            await db.models.Stop.findByPk(stopId),
            await db.models.RoutePattern.findByPk(routePatternId),
        ]);

        if (!stop) {
            throw new NoSuchEntityError(
                `No stop found with ID '${stopId}' to associate to route pattern with ID '${routePatternId}'`
            );
        }

        if (!routePattern) {
            throw new NoSuchEntityError(
                `No route pattern found with ID '${routePatternId}' to associate to stop with ID '${stopId}'`
            );
        }

        try {
            await routePattern.addStop(stop);
        } catch (e) {
            throw new CouldNotSaveError(
                `Could not associate stop with ID '${stopId}' to route pattern with ID '${routePatternId}'. Reason: ${e.message}`
            );
        }
    },
};

async function findDataFromApi(stopId) {
    const { stop } = await hslGraphQL.query(
        `{
            stop(id: "${stopId}") {
                name
                lat
                lon
            }
        }`,
        {
            priority: hslGraphQL.requestPriority.high,
        }
    );

    return stop;
}

async function createStopToDb(stopId, stopData) {
    const {
        name,
        lat: latitude,
        lon: longitude,
    } = stopData;

    const db = await initDb();

    const [stop] = await db.models.Stop.findOrCreate({
        where: {
            id: stopId,
            name,
            latitude,
            longitude,
        },
    });

    return stop;
}

