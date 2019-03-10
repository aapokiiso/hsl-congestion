'use strict';

const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');

const appConfig = require('./config');

// Instance cached here.
let dbInstance;

function initConnection() {
    return new Sequelize(
        appConfig.db.name,
        appConfig.db.username,
        appConfig.db.password,
        {
            host: appConfig.db.host,
            port: appConfig.db.port,
            dialect: appConfig.db.dialect,
        }
    );
}

async function importModels(sequelize) {
    const modelsDir = path.resolve(__dirname, 'model');

    const fileNames = await getFileNames(modelsDir);

    fileNames
        .filter(fileName => !isHiddenFile(fileName))
        .forEach(importModel);

    function getFileNames(dir) {
        return new Promise(function (resolve, reject) {
            fs.readdir(dir, (err, fNames) => {
                if (err) {
                    return reject(err);
                }

                return resolve(fNames);
            });
        });
    }

    function isHiddenFile(fileName) {
        // Skip '.' and '..'

        return fileName.indexOf('.') === 0;
    }

    function importModel(fileName) {
        sequelize.import(path.join(modelsDir, fileName));
    }
}

async function syncDb(sequelize) {
    const shouldForceSync = appConfig.db.forceSync;

    if (shouldForceSync) {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;', { raw: true });
    }

    // Promise.resolve ensures thenable Promise even in production (disableKeyChecks is undefined)
    await sequelize.sync({ force: shouldForceSync });

    if (shouldForceSync) {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;', { raw: true });
    }
}

module.exports = {
    async init() {
        if (dbInstance) {
            return dbInstance;
        }

        dbInstance = await initConnection();
        await importModels(dbInstance);
        await syncDb(dbInstance);

        return dbInstance;
    },
};
