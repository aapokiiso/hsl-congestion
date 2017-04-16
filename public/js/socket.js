'use strict';

import io from 'socket.io-client';
import emitter from './event-emitter';
import eventName from './include/event-name';

const socket = io();
