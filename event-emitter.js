'use strict';

const EventEmitter = require('events').EventEmitter;

// Singleton event emitter
module.exports = (function initEmitter() {
    return new EventEmitter();
}());
