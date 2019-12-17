'use strict';
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const TestBugger = require('test-bugger');
const testBugger = new TestBugger({'fileName': __filename});


/**
 * This function establishes connection with databse and keeps track of connection status
 * @param {string} dbUrl Mongo's DB URL
 * @return {object} Mongo DB Connection Object
 */
function dbConnectionMaker(dbUrl) {

    var dbObject = mongoose.createConnection(dbUrl, {
        "readPreference": "nearest",
        "auto_reconnect": true,
        "server": {
            "reconnectTries": Number.MAX_VALUE,
            "reconnectInterval": 2000,
        }
    });

    dbObject.on('connected', function () {
        testBugger.successLog('Mongoose connection open to ' + dbUrl)
    });

    /**
     * If Error occures in connection following function executes
     */
    dbObject.on('error', function (err) {
        testBugger.errorLog('Mongoose connection error: ' + err);
        process.exit(1)
    });

    /**
     * When connection is disconnected following function is executed
     */
    dbObject.on('disconnected', function () {
        testBugger.successLog('Mongoose connection disconnected');
    });

    dbObject.on('SIGINT', function () {
        dbObject.close(function () {
            testBugger.successLog('Mongoose connection disconnected through app termination');
            process.exit(0);
        });
    });

    return dbObject
}


module.exports = dbConnectionMaker;