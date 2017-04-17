'use strict';

const ENV_DEVELOPMENT = 'development';
const ENV_PRODUCTION = 'production';

const envName = process.env.NODE_ENV || ENV_DEVELOPMENT;
const envJson = require('./config/' + envName + '.json');

/**
 * @type {Object}
 * @property {number} httpPort
 * @property {String} db.host
 * @property {number} db.port
 * @property {String} db.name
 * @property {String} db.username
 * @property {String} db.password
 * @property {boolean} db.forceSync
 * @property {boolean} ssl.enabled
 * @property {String} ssl.key
 * @property {String} ssl.cert
 * @property {String} ssl.ca
 * @property {String} publicDir
 * @property {boolean} webpack.watch
 * @property {boolean} webpack.hot
 * @property {String} mqtt.host
 * @property {number} mqtt.port
 * @property {String} mqtt.topic
 * @property {String} env
 * @property {Function} isProduction
 */
let config = Object.create(envJson);

config.env = envName;
config.isProduction = function () {
    return this.env == ENV_PRODUCTION;
};

module.exports = config;
