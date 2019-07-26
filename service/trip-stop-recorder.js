'use strict';

const initDb = require('../db');
const CouldNotSaveError = require('../error/could-not-save');

module.exports = {
    /**
     * @param {string} tripId
     * @param {string} stopId
     * @param {Date} seenAtStop
     * @param {boolean} hasDoorsOpen
     * @returns {Promise<object>}
     */
    async recordTripStop(tripId, stopId, seenAtStop, hasDoorsOpen) {
        const db = await initDb();

        try {
            return await db.models.TripStop.create({
                tripId,
                stopId,
                seenAtStop,
                doorsOpen: hasDoorsOpen,
            });
        } catch (e) {
            throw new CouldNotSaveError(
                `Failed to record trip stop. Reason: ${e.message}`
            );
        }
    },
};
