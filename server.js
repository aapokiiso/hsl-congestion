'use strict';

/**
 * NOTICE OF LICENSE
 *
 * This source file is released under commercial license by Lamia Oy.
 *
 * @copyright Copyright (c) 2019 Lamia Oy (https://lamia.fi)
 */

const express = require('express');
const appConfig = require('./config');

const app = express();

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(process.env.PORT);
