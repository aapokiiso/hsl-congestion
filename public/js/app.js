'use strict';

import Vue from 'vue';
import App from './component/App.vue';

new Vue({
    el: '#app',
    render: createElement => createElement(App)
});

import './socket';
import './sw-client';

import 'file-loader?name=sw.js!babel-loader!./sw';
import 'file-loader?name=js/idb.js!idb';
import 'file-loader?name=manifest.json!../manifest.json';

// @todo App icons
// import '../img/icon/32x32.png'; // Favicon (not app icon)
// import '../img/icon/48x48.png';
// import '../img/icon/72x72.png';
// import '../img/icon/96x96.png';
// import '../img/icon/144x144.png';
// import '../img/icon/192x192.png';
