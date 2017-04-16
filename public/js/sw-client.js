'use strict';

import emitter from './event-emitter';
import eventName from './include/event-name';

const swCommand = {};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(() => {
            // Only bind / emit events when SW is activated
            // and controller is present (usually after user has navigated away from page and come back).
            if (navigator.serviceWorker.controller) {
                bindEventListeners();
                emitCache();
            }
        })
        .catch(err => console.error(err));
}

function bindEventListeners() {
    // @todo
}

function emitCache() {
    // @todo
}

function sendMessage(command, data = {}) {
    return new Promise((resolve, reject) => {
        const ch = new MessageChannel();

        ch.port1.onmessage = function ({data} = {}) {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data);
            }
        };

        const msgData = {
            command
        };
        for (let key in data) {
            msgData[key] = data[key];
        }

        navigator.serviceWorker.controller.postMessage(msgData, [ch.port2]);
    });
}
