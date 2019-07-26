'use strict';

const CouldNotParseError = require('../error/could-not-parse');

module.exports = {
    /**
     * @param realtimeId - Realtime API ID
     * @returns {string} - Routing API ID
     * @throws CouldNotParseError - if no Realtime API ID given.
     */
    convertRealtimeApiForRoutingApi(realtimeId) {
        if (!realtimeId) {
            throw new CouldNotParseError(
                `Could not parse empty Realtime API ID to Routing API GTFS ID.`
            );
        }

        return `HSL:${realtimeId}`;
    },
};
