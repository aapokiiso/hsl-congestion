'use strict';

self.importScripts('dist/js/idb.js');

const swCommand = {};

const cacheNames = [
    'hslcongestion-cache-v1'
];

// Skip cache check for URLs containing
const cacheBlacklist = [
    'socket.io',
    '__webpack_hmr'
];

const assetsManifestPath = 'dist/assets-manifest.json';

const dbName = 'hslcongestion';
const dbVersion = 1;

const dbStore = {};
const dbIndex = {};

// SW-specific IndexedDB instance.
let db;

self.addEventListener('install', function (event) {
    const getAssetsConfig = fetch(assetsManifestPath)
        .then(response => response.json());

    // Base page has to be cached separately (HTTP Basic auth).
    const pageReq = new Request('/');
    const cachePage = Promise.all([openCache(), fetch(pageReq, {credentials: 'include'})])
        .then(([cache, response]) => cache.put(pageReq, response.clone()));

    const cacheAssets = Promise.all([openCache(), getAssetsConfig])
        .then(([cache, assetsConfig]) => {
            const initialCachePaths = [
                assetsConfig['main.js'],
                assetsConfig['manifest.json']
            ];

            return cache.addAll(initialCachePaths);
        });

    event.waitUntil(Promise.all([cachePage, cacheAssets]));
});

self.addEventListener('activate', function (event) {
    event.waitUntil(cleanOldCaches());
});

self.addEventListener('fetch', function (event) {
    if (isCacheable(event.request)) {
        const matchCache = caches.match(event.request);

        const getResponse = matchCache
            .then(response => response || fetchAndCache(event.request));

        event.respondWith(getResponse);
    }
});

self.addEventListener('message', function (event) {
    switch (event.data.command) {
        // @todo
    }
});

/**
 * @returns {Promise<Cache>}
 */
function openCache() {
    // Current cache is the last in array.
    const currentCacheName = cacheNames.slice().pop();

    return caches.open(currentCacheName);
}

/**
 * @param {Request} request
 * @returns {boolean}
 */
function isCacheable(request) {
    // Cacheable if URL doesn't contain any of the cache blacklist parts.
    return request.url && !cacheBlacklist.some(blacklisted => request.url.indexOf(blacklisted) >= 0);
}

/**
 * @param {Request} request
 * @returns {Promise.<Response>}
 */
function fetchAndCache(request) {
    return fetch(request)
        .then(response => {
            const responseToCache = response.clone();
            openCache().then(cache => cache.put(request, responseToCache));

            return response;
        });
}

/**
 * @returns {Promise.<[boolean]>}
 */
function cleanOldCaches() {
    // Old caches = all except latest
    const oldCacheNames = cacheNames.slice(0, -1);

    return caches.keys()
        .then(cacheNames => {
            return Promise.all(cacheNames.map(cacheName => {
                if (oldCacheNames.includes(cacheName)) {
                    return caches.delete(cacheName);
                }
            }));
        });
}

function getDb() {
    if (db) {
        return Promise.resolve(db);
    }

    return self.idb
        .open(dbName, dbVersion, upgradeDB => {
            // @todo create stores
        });
}
