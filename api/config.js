'use strict';

const ENV_DEFAULT = 'local';
const ENV_PRODUCTION = 'production';

const envName = process.env.NODE_ENV || ENV_DEFAULT;
const envJson = require(`./config/${envName}.json`);

const moment = require('moment-timezone');
moment.tz.setDefault(envJson.timezone);

/**
 * @type {Object}
 * @property {number} timezone
 * @property {String} db.dialect
 * @property {String} db.host
 * @property {number} db.port
 * @property {String} db.name
 * @property {String} db.username
 * @property {String} db.password
 * @property {boolean} db.forceSync
 * @property {boolean} db.logging
 * @property {String} db.socketPath
 * @property {boolean} ssl.enabled
 * @property {String} ssl.key - SSL private key
 * @property {String} ssl.cert - SSL certificate
 * @property {String} ssl.ca - SSL certificate authority
 * @property {String} mqtt.host
 * @property {number} mqtt.port
 * @property {String} mqtt.topic
 * @property {String} graphql.url
 * @property {String} env
 * @property {Number} hsl.stopRadiusMeters - Radius for what is registered for a
 *                                           trip (eg. vehicle) visiting a stop.
 * @property {Number} hsl.maxStopSeconds - Upper ceiling for stop congestion.
 *                                         Anything over this is classified as maximum congestion!
 * @property {Number} hsl.maxTripAgeDays - How long to persist trips in db
 * @property {Function} isProduction
 */
module.exports = Object.assign({}, envJson, {
    env: envName,
    isProduction() {
        return this.env === ENV_PRODUCTION;
    },
});
