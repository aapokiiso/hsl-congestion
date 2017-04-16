'use strict';

const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const config = require('./config');

// Instance cached here.
let sequelize;

function initConnection() {
    return new Promise((resolve) => {
        const seq = new Sequelize(config.db.name, config.db.username, config.db.password, {
            host: config.db.host,
            port: config.db.port
        });

        resolve(seq);
    });
}

function importModels(seq) {
    return new Promise((resolve, reject) => {
        const modelsDir = path.resolve(__dirname, 'model');

        getFileNames(modelsDir)
            .then((fileNames) => {
                fileNames
                    .filter((fName) => fName.indexOf('.') !== 0) // Skip '.' and '..'
                    .forEach((fName) => seq.import(path.join(modelsDir, fName)));
            })
            .then(resolve)
            .catch(reject);
    });

    function getFileNames(dir) {
        return new Promise((resolve, reject) => fs.readdir(dir, (err, fNames) => {
            if (err) {
                return reject(err);
            }

            return resolve(fNames);
        }));
    }
}

function syncDb(seq) {
    const forceSync = config.db.forceSync;

    let disableKeyChecks;
    if (forceSync) {
        disableKeyChecks = seq.query('SET FOREIGN_KEY_CHECKS = 0;', {raw: true});
    }

    // Promise.resolve ensures thenable Promise even in production (disableKeyChecks is undefined)
    let syncDb = Promise.resolve(disableKeyChecks).then(() => seq.sync({force: forceSync}));

    let enableKeyChecks;
    if (forceSync) {
        enableKeyChecks = syncDb.then(() => seq.query('SET FOREIGN_KEY_CHECKS = 1;', {raw: true}));
    }

    // Make sure to return Promise.
    return Promise.resolve(enableKeyChecks);
}

module.exports = {
    /**
     * @returns Promise
     */
    init: function() {
        return new Promise((resolve, reject) => {
            if (sequelize) {
                // Return already loaded instance and models.
                return resolve(sequelize);
            }

            initConnection() // Promise returning Sequelize instance.
                .then(seq => sequelize = seq) // Cache instance in case init() is called multiple times.
                .then(() => importModels(sequelize))
                // .then(() => syncDb(sequelize))
                .then(() => resolve(sequelize))
                .catch(reject);
        });
    }
};
