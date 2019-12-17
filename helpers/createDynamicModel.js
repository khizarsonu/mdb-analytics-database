'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //for avoiding usage of outdate Promise library in mongoose library

const config = require('../config/project.config');
const dbURI = config.mongo.dbURL;
const createConnection = require('../dbConnection/dbConnection');

// const dbConnection = createConnection(dbURI);

const dummySchema = mongoose.Schema({}, {strict: false});

module.exports = function (DBconnection, dataSourceModelName) {
    let model = false;
    try {
        // console.log("DSNAME: ==> " + `${dataSourceModelName}`);
        model = DBconnection.model(`${dataSourceModelName}`, dummySchema, `${dataSourceModelName}`)
    } catch (e) {
        console.error("Error in creating Model");
        console.error(e)
    }
    return model
};