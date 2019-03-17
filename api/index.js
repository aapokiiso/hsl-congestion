'use strict';

const fs = require('fs');
const express = require('express');
const enforceSSL = require('express-enforces-ssl');
const helmet = {
    hsts: require('hsts'),
};
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

if (appConfig.ssl.enabled) {
    api.use(helmet.hsts());
    api.use(enforceSSL());
}

api.use('/api', require('./endpoint/departures'));
api.use('/api', require('./endpoint/stops'));

server.listen(process.env.PORT);
