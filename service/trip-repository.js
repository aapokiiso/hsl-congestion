'use strict';

const initDb = require('../db');
const hslGraphQL = require('../include/hsl-graphql');
const NoSuchEntityError = require('../error/no-such-entity');
const CouldNotSaveError = require('../error/could-not-save');

module.exports = {
    /**
     * @param {string} tripId
     * @returns {Promise<object>}
     * @throws NoSuchEntityError
     */
    async getById(tripId) {
        const db = await initDb();

        const trip = await db.models.Trip.findByPk(tripId);

        if (!trip) {
            throw new NoSuchEntityError(
                `Could not find trip with ID '${tripId}'`
            );
        }

        return trip;
    },
    /**
     * @param {string} tripId
     * @returns {Promise<object>}
     * @throws CouldNotSaveError
     */
    async createById(tripId) {
        try {
            const tripData = await findDataFromApi(tripId);

            return await createTripToDb(tripId, tripData);
        } catch (e) {
            throw new CouldNotSaveError(
                `Could not save trip with ID '${tripId}'. Reason: ${e.message}`
            );
        }
    },
};

async function findDataFromApi(tripId) {
    const { trip } = await hslGraphQL.query(
        `{
            trip(id: "${tripId}") {
                pattern {
                    code
                }
            }
        }`,
        {
            priority: hslGraphQL.requestPriority.high,
        }
    );

    return trip;
}

async function createTripToDb(tripId, tripData) {
    const {
        pattern: routePatternData,
    } = tripData;

    const {
        code: routePatternId,
    } = routePatternData;

    const db = await initDb();

    const [trip] = await db.models.Trip.findOrCreate({
        where: {
            id: tripId,
            routePatternId,
        },
    });

    return trip;
}
