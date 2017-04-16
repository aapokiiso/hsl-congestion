'use strict';

const path = require('path');
const config = require('../config');

/**
 * @param {Object.<String, Sequelize.Model>} models
 */
module.exports = function (models) {
    const router = require('express').Router();

    router.get('/', (req, res) => {
        res.render('index', {
            config: config
        });
    });

    return router;
};
