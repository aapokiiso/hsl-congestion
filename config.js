'use strict';

const ENV_DEFAULT = 'local';
const ENV_PRODUCTION = 'production';

const envName = process.env.NODE_ENV || ENV_DEFAULT;
const envJson = require(`./config/${envName}.json`);

/**
 * @type {Object}
 * @property {number} httpPort
 * @property {String} db.dialect
 * @property {String} db.host
 * @property {number} db.port
 * @property {String} db.name
 * @property {String} db.username
 * @property {String} db.password
 * @property {boolean} db.forceSync
 * @property {boolean} db.logging
 * @property {String} mqtt.host
 * @property {number} mqtt.port
 * @property {String} mqtt.topic
 * @property {String} graphql.url
 * @property {String} env
 * @property {Function} isProduction
 */
module.exports = Object.assign({}, envJson, {
    env: envName,
    isProduction() {
        return this.env === ENV_PRODUCTION;
    },
});
