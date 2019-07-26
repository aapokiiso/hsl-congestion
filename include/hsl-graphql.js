'use strict';

const request = require('request-promise-native');
const Bottleneck = require('bottleneck');
const NodeCache = require('node-cache');
const appConfig = require('../config');
const seconds = require('./seconds');

// There is no real rate limiting in the HSL GraphQL API,
// but it is recommended to limit requests to 10 per second.
const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 100,
});

const queryCache = new NodeCache({
    stdTTL: seconds.day,
    useClones: false, // Caching query responses as promises
});

module.exports = {
    requestPriority: {
        high: 0,
        default: 5,
        low: 9,
    },

    /**
     * @param {string} query - GraphQL query
     * @param {object} [options]
     * @param {number} [options.cacheLifetime] - how long to cache query response. Defaults to 1 day.
     * @param {number} [options.priority] - between 0 (high) and 9 (low). Defaults to 5.
     * @returns {Promise<object>}
     */
    async query(query, {cacheLifetime, priority} = {}) {
        let responsePromise = queryCache.get(query);

        if (!responsePromise) {
            responsePromise = limiter.schedule(
                {priority},
                () => request.post(
                    appConfig.graphql.url,
                    {
                        body: {
                            query,
                        },
                        json: true,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
            );

            queryCache.set(query, responsePromise, cacheLifetime);
        }

        const {data: result} = await responsePromise;

        return result;
    }
};
