'use strict';

const initDbInstance = require('@aapokiiso/hsl-congestion-db-schema');
const appConfig = require('./config');

module.exports = initDbInstance(appConfig.db);
