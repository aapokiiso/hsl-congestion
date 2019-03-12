'use strict';

/**
 * HSL has different direction mappings in their Realtime Vehicle
 * position API and their Routing API.
 *
 * The direction ID values themselves don't hold any meaning,
 * since the route pattern's shape defines them (eg. north-south or west-east)
 *
 * realtime_api_direction_id -> routing_api_direction_id
 */
const ROUTING_API_DIRECTION_ID = {
    1: 0,
    2: 1,
};

module.exports = {
    convertRealtimeApiForRoutingApi(directionId) {
        return ROUTING_API_DIRECTION_ID[directionId];
    },
    convertRoutingApiForRealtimeApi(directionId) {
        const idx = Object.values(ROUTING_API_DIRECTION_ID).indexOf(directionId);

        return Object.keys(ROUTING_API_DIRECTION_ID)[idx];
    },
};
