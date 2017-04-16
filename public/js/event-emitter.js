'use strict';

import EventEmitter from 'events';

// CommonJS modules are singletons
// -> EventEmitter instantiated only once (below).

export default new EventEmitter;
