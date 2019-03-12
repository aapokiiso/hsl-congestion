'use strict';

const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');

const appConfig = require('./config');

function initConnection() {
    return new Sequelize(
        appConfig.db.name,
        appConfig.db.username,
        appConfig.db.password,
        {
            host: appConfig.db.host,
            port: appConfig.db.port,
            dialect: appConfig.db.dialect,
            operatorsAliases: Sequelize.Op,
            logging: appConfig.db.logging,
        }
    );
}

async function importModels(sequelize) {
    const modelsDir = path.resolve(__dirname, 'orm');

    const fileNames = await getFileNames(modelsDir);

    const models = fileNames
        .filter(fileName => !isHiddenFile(fileName))
        .map(importModel)
        .reduce((models, model) => {
            models[model.name] = model;

            return models;
        }, {});

    Object.keys(models)
        .forEach(modelName => {
            if (typeof models[modelName].associate === 'function') {
                models[modelName].associate(models);
            }
        });

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
        return sequelize.import(path.join(modelsDir, fileName));
    }
}

async function syncDb(sequelize) {
    const shouldForceSync = appConfig.db.forceSync;

    if (shouldForceSync) {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;', { raw: true });
    }

    await sequelize.sync({ force: shouldForceSync });

    if (shouldForceSync) {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;', { raw: true });
    }
}

let dbInstance;

module.exports = function getDbInstance() {
    if (!dbInstance) {
        // Wrap it immediately in a Promise to prevent race conditions.
        dbInstance = new Promise(async resolve => {
            const instance = initConnection();
            await importModels(instance);
            await syncDb(instance);

            return resolve(instance);
        });
    }

    return dbInstance;
};
