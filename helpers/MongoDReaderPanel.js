'use strict';

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const TestBugger = require('test-bugger');
const testBugger = new TestBugger({'fileName': __filename});

const config = require('../config/project.config');
const dbURL = config.mongo.dbURL;


async function _runAdminCommand(conn, cmd, maxTry = 1) {
    return new Promise((resolve, reject) => {
        let to = setTimeout(function () {
            testBugger.errorLog("Timeout for runAdminCommand");
            if (maxTry < 2) {
                maxTry++;
                clearTimeout(to);
                resolve(_runAdminCommand(conn, cmd, maxTry))
            } else {
                clearTimeout(to);
                resolve(false)
            }

        }, 1000);

        conn.db.admin().command(cmd, (err, result) => {
            if (err) {
                testBugger.errorLog(err)
            }

            clearTimeout(to);
            resolve(result)
        })
    })
}

async function _runCommand(conn, cmd) {
    return new Promise((resolve, reject) => {
        conn.db.command(cmd, (err, result) => {
            if (err) {
                testBugger.errorLog(err)
            }
            resolve(result)
        })
    })
}

/**
 * This class provides method which are responsible for 
 * variety of the functionality of mongoDB from mongoose.
 **/
class MongoDReader {
    constructor(){
        this.dbConn = {},
        this.port = '',
        this.db = ''
    }
    
    
    /**
     * Represents a getDbList.
     * @Function
     * @param {object} conn - mongo connection object.
     * @returns {object} - Containes all database names
     * @description - This function will fetch all database on that connections
    */
    async getDbList(conn){
        let dbObjects = {};
        try {
            dbObjects = await _runAdminCommand(conn, {listDatabases: 1});
            if (dbObjects) {
                // testBugger.warningLog(JSON.stringify(dbObjects.databases));
                return dbObjects.databases
            }

            return dbObjects

        } catch (e) {
            testBugger.errorLog('Error in run admin command');
            testBugger.errorLog(e)
        }
        return dbObjects

    }

    /**
     * Represents a dropCollection.
     * @Function
     * @param {object} conn - mongo connection object.
     * @param {string} collectionName - name of the collection
     * @returns {object} return true
     * @description - This function will delete that collection from that database.
    */
    async dropCollection(conn, collectionName){
        let result = false
        try {

            result = await _runCommand(conn, {drop: collectionName});
        } catch (e) {
            testBugger.errorLog("error in removing collection")
            testBugger.errorLog(e)
        }
        return result
    }
    /**
     * Represents a getCollections.
     * @Function 
     * @param {object} conn - mongo connection object.
     * @return {object} - object of all collections
     * @description - This function gives all collections.
    */
    async getCollections(conn){
        let collectionObject = {};

        try {
            collectionObject = await _runCommand(conn,{listCollections: 1, nameOnly: true});
            testBugger.warningLog(JSON.stringify(collectionObject.cursor.firstBatch));
            return collectionObject.cursor.firstBatch

        } catch (e) {
            testBugger.errorLog('Error in getting list of Collection');
            testBugger.errorLog(e)
        }

        return collectionObject
    }

    async findQuery(conn, collection_name){
    let result = false
        try {
            result = await _runCommand(conn, {find: collection_name});
            // console.log(result)
        } catch (e) {
            testBugger.errorLog("error in removing collection")
            testBugger.errorLog(e)
        }
        return result
    }
    async findAggryQuery(conn, collection_name){
        let result = false
        try {
            // console.log(result)
        } catch (e) {
            testBugger.errorLog("error in removing collection")
            testBugger.errorLog(e)
        }
        return result
    }

    async get_index(conn, collection_name){
        let result = 0
        try{
            result = await _runAdminCommand(conn, { "listIndexes": collection_name });
        }catch(e){
            testBugger.errorLog("error in getting list of index")
            testBugger.errorLog(e)
        }
        return result
    }
}

module.exports = MongoDReader;
