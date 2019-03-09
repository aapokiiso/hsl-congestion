'use strict';

const request = require('request-promise-native');
const appConfig = require('../config');

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

module.exports = async function queryGraphql(query) {
    const {data: result} = await request.post(appConfig.graphql.url, {
        body: {
            query,
        },
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return result;
};
