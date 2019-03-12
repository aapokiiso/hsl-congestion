'use strict';

const request = require('request-promise-native');
const appConfig = require('../config');

module.exports = async function queryGraphQL(query) {
    const { data: result } = await request.post(
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
    );

    return result;
};
