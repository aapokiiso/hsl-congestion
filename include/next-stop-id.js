'use strict';

const gtfsIdLib = require('./gtfs-id');
const CouldNotParseError = require('../error/could-not-parse');

module.exports = {
    /**
     * @see https://digitransit.fi/en/developers/apis/4-realtime-api/vehicle-positions-2/
     *      Search for "next_stop"
     */
    END_OF_LINE_ID: 'EOL',

    /**
     * @param {string} realtimeNextStopId - next stop ID in the Realtime API
     * @returns {boolean}
     */
    isEndOfLine(realtimeNextStopId) {
        return realtimeNextStopId === this.END_OF_LINE_ID;
    },

    /**
     * @param {string} realtimeNextStopId - next stop ID in the Realtime API
     * @returns {string}
     * @throws CouldNotParseError - if trip is in end of line
     */
    convertRealtimeApiForRoutingApi(realtimeNextStopId) {
        if (this.isEndOfLine(realtimeNextStopId)) {
            throw new CouldNotParseError(
                `Could not parse next stop GTFS ID, the trip is in end of line.`
            );
        }

        return gtfsIdLib.convertRealtimeApiForRoutingApi(realtimeNextStopId);
    },
};
