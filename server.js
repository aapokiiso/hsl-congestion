'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const enforceSSL = require('express-enforces-ssl');
const helmet = {
    hsts: require('hsts')
};

const config = require('./config');
const sequelize = require('./sequelize');
const eventEmitter = require('./event-emitter');
const eventName = require('./event-name');

const httpServer = require('http').createServer(app);

let httpsServer;
if (config.ssl.enabled) {
    const creds = {
        key: fs.readFileSync(config.ssl.key),
        cert: fs.readFileSync(config.ssl.cert),
        ca: fs.readFileSync(config.ssl.ca)
    };

    httpsServer = require('https').createServer(creds, app);
}

const io = require('socket.io')(httpsServer || httpServer);

sequelize.init()
    .then((seq) => {
        // Express config

        app.set('views', './view');
        app.set('view engine', 'ejs');

        if (config.ssl.enabled) {
            // Push users to HTTPS.
            app.use(helmet.hsts());
            app.use(enforceSSL());
        }

        app.use(bodyParser.json());

        app.use('/', require('./route/app')(seq.models));

        if (config.webpack.watch) {
            const webpackConfig = require('./webpack.config');
            const webpackCompiler = require('webpack')(webpackConfig);

            const webpackDevMiddleware = require('webpack-dev-middleware')(webpackCompiler, {
                publicPath: webpackConfig.output.publicPath
            });
            app.use(webpackDevMiddleware);

            if (config.webpack.hot) {
                const webpackHotMiddleware = require('webpack-hot-middleware')(webpackCompiler);
                app.use(webpackHotMiddleware);
            }

            // Serve client logos outside webpack.
            const logoDir = path.join(config.publicDir, 'logo');
            app.use(logoDir, express.static(path.join(__dirname, logoDir)));
        } else {
            // ServiceWorker needs root scope, so serve from /, not /dist/.
            app.use('/sw.js', express.static(path.join(__dirname, config.publicDir, 'sw.js')));
            app.use('/.well-known', express.static(path.join(__dirname, '.well-known'))); // Used by Let's Encrypt
            app.use(config.publicDir, express.static(path.join(__dirname, config.publicDir)));
        }

        // Socket.IO events

        io.on('connection', (socket) => {
            eventEmitter.emit(eventName.socketConnect, socket);
        });

        // Start servers

        httpServer.listen(config.httpPort);

        if (httpsServer) {
            httpsServer.listen(443);
        }
    })
    .catch(console.error);
