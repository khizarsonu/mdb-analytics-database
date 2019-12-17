'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //for avoiding usage of outdate Promise library in mongoose library

const config = require('../config/project.config');
const dbURI = config.mongo.dbURL;
const createConnection = require('../dbConnection/dbConnection');


module.exports = function (dataSourceModelName) {
    return new Promise((resolve)=>{
        // console.log(`${dbURI}/${dataSourceModelName}`)
        const dbConnection = createConnection(`${dbURI}/${dataSourceModelName}`);
        dbConnection.on("open",()=>{
            resolve(dbConnection)
        })
    })
};