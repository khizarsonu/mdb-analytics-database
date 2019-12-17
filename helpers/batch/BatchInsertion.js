'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise; //for avoiding usage of outdate Promise library in mongoose library
const dbConnectionMaker = require('../../dbConnection/dbConnection');
const config = require('../../config/project.config');
const dbURL = config.mongo.dbURL;
const DBPANEL = require('./../MongoDReaderPanel');
const dbPanel = new DBPANEL();
// const createConnection = require('../../dbConnection/dbConnection');
const createDynamicModel = require('../../helpers/createDynamicModel');

const promis_conn = require('../../dbConnection/promisify_connection')
let promisify = new promis_conn()

/**
 * This class provides method which are responsible for 
 * all the functions of Batch insertion and send data to mongo after processing.
 **/
class BatchInsertion{
    constructor(){
        // console.log("constroctor called")
    }

    /**
     * @async
     * Represents a insert_batch.
     * @Function
     * @param {object} dataStack - data and data source name.
     * @description - This function process bunch of datastack and seperate database with data source. 
    */
    async insert_batch(dataStack) {
        // console.log("insert in mongo",data)
        try {
            let alldatabase = dataStack.map((element) => {
                return element.database
            });
            let filterDatabases = Array.from(new Set(alldatabase));
            // console.log(filterDatabases)
            
            let callbacks = filterDatabases.map(async (database) => {
                let data = [];

                for (let dataObject of dataStack) {
                    if (dataObject.database == database) {
                        data.push(dataObject.dataOBJ);
                    }
                }
                into_mongo(database, data)
                
            });
        } catch (err) {
            testBugger.errorLog(`Error in Insert Many operating at BatchRouting for`);
            testBugger.errorLog(err)
        }
    }
}

/**
 * @async
 * Represents a into_mongo.
 * @Function
 * @param {object} database - All datasource name.
 * @param {object} data - Data to be insert into datasource.
 * @description - This function is responsible for insert all data into database with many insertion
*/
async function into_mongo(database, data)
{
    // console.log(database)
    // console.log(data)
    let conn = await promisify.promiseConnection(database);
    let DynamicModel = createDynamicModel(conn, `${database}_data`);

    // console.log("MODEL" + DynamicModel)
    // console.log(typeof data[0].timestamp.date)
    let response = ""
    try{
        response = await DynamicModel.insertMany(data)
    }catch(e){
        testBugger.errorLog("errror in data insertion")
        testBugger.errorLog(e)
    }    
    try {
        if(response){
            // console.log("Data Insterted Success!")
            let inde = await DynamicModel.collection.getIndexes()
            // inde = inde["_id_"][0][1]
            inde = Object.keys(inde).length
            
            if (inde == 1){
                let index_obj = {}
                let schema_result = await dbPanel.findQuery(conn, `${database}_schema`);
                Object.getOwnPropertyNames(schema_result.cursor.firstBatch[0].dimensions).map((dim)=>{
                    Object.assign(index_obj, {[dim]:1})
                })
                await DynamicModel.collection.createIndex(index_obj, {name:"dimensions"})
            }else{
                console.log("index is alrady created.")
            }
        }
    } catch (e) {
        console.log("Error in indexing")
        console.log(e)
    }

}
module.exports = BatchInsertion