'use strict';

const fs = require('fs');
const express = require('express');
const enforceSSL = require('express-enforces-ssl');
const helmet = {
    hsts: require('hsts'),
};
const cors = require('cors');
const db = require('@aapokiiso/hsl-congestion-db-schema');

const appConfig = require('./config');

const api = express();

let server;
if (appConfig.ssl.enabled) {
    const creds = {
        key: fs.readFileSync(appConfig.ssl.key),
        cert: fs.readFileSync(appConfig.ssl.cert),
        ca: appConfig.ssl.ca ? fs.readFileSync(appConfig.ssl.ca) : null,
    };

    server = require('https').createServer(creds, api);
} else {
    server = require('http').createServer(api);
}

api.use(cors());

if (appConfig.ssl.enabled) {
    api.use(helmet.hsts());
    api.use(enforceSSL());
}

api.use('/', require('./endpoint/congestion-rates'));

(async function initDbAndStartServer() {
    await db.init(appConfig.db);

    server.listen(process.env.PORT);
})();
