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
            dialectOptions: {
                socketPath: appConfig.db.socketPath,
            },
            sync: {
                force: appConfig.db.forceSync,
            },
        },
    );
}

function importModels(sequelize) {
    const modelsDir = path.resolve(__dirname, 'model');

    const fileNames = getFileNames(modelsDir);

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
        return fs.readdirSync(dir);
    }

    function isHiddenFile(fileName) {
        // Skip '.' and '..'

        return fileName.indexOf('.') === 0;
    }

    function importModel(fileName) {
        return sequelize.import(path.join(modelsDir, fileName));
    }
}

let dbInstance;

module.exports = (function IIFEInitDbInstance() {
    if (!dbInstance) {
        dbInstance = initConnection();
        importModels(dbInstance);
    }

    return dbInstance;
})();
