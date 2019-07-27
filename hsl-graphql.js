'use strict';

const initHSLGraphQL = require('@aapokiiso/hsl-congestion-graphql-gateway');

let gatewayInstance;

module.exports = (function IIFEInitHSLGraphQL() {
    if (!gatewayInstance) {
        gatewayInstance = initHSLGraphQL();
    }

    return gatewayInstance;
})();
