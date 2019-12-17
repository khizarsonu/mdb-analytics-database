const TestBugger = require('test-bugger');
const testBugger = new TestBugger({fileName: __filename});

const createDynamicDB = require('./../helpers/createDynamicDB');
const createDynamicModel = require('../helpers/createDynamicModel');

const DBPANEL = require('../helpers/MongoDReaderPanel');
const dbPanel = new DBPANEL();

const Batch = require("./../helpers/batch/BatchRoutin");

var isEqual = require('lodash.isequal');

const dateRegexString = '((?:2|1)\\d{3}(?:-|\\/)(?:(?:0[1-9])|(?:1[0-2]))(?:-|\\/)(?:(?:0[1-9])|(?:[1-2][0-9])|(?:3[0-1]))(?:T|\\s)(?:(?:[0-1][0-9])|(?:2[0-3])):(?:[0-5][0-9]):(?:[0-5][0-9]))';	// Time Stamp 1
let dateRegex = new RegExp(dateRegexString,["i"]);

const Promis_DBconn = require('../dbConnection/promisify_connection')
let promisifyDbConnection = new Promis_DBconn()


let batchRoute = new Batch();
let callback = batchRoute.reception.bind(batchRoute);

/**
 * This class provides method which are responsible for 
 * all the functions of mdb
 **/
class handler {
    
    /**
     * @async
     * Represents a alive.
     * @Function
     * @param {json} req - Request comming.
     * @param {json} res - Reponse.
     * @description - This function is for test aliveness of the api.
    */
    alive(req, res) {
        testBugger.informLog("Rest API...! alive ok");
        res.status(202).send(true)
    };

    /**
     * @async
     * Represents a createDataSource.
     * @Function
     * @param {json} req - Request comming.
     * @param {json} res - Reponse.
     * @description - This function responsible to create new db with two collection and inseted structure in schema
    */
    async createDataSource(req, res) {

        let dataSourceName = req.params.datasource || false
        let schema = req.body
        let result = { response: false, reason: 'notGiven'};
        if(dataSourceName) {
            if ((Object.getOwnPropertyNames(schema)).length != 0) {
                let dbFound = false
                let conn = await promisifyDbConnection.promiseConnection(dataSourceName);
                let dbs = await dbPanel.getDbList(conn);

                dbs.map(function (db) {
                    if (dataSourceName == db.name) {
                        dbFound = true
                    }
                });

                result.reason = "DataSource Already Exist";

                if (!dbFound) {
                    let DynamicDB = await createDynamicDB(dataSourceName);
                    let DynamicModel = createDynamicModel(DynamicDB, `${dataSourceName}_schema`);

                    let saveRecord = false
                    // testBugger.errorLog(req.body)
                    if (DynamicModel) {
                        let newRecords = new DynamicModel(req.body);
                        try {
                            saveRecord = await newRecords.save()
                        } catch (e) {
                            console.error("Error in saving records");
                            console.error(e)
                        }
                    }
                    if (saveRecord) {
                        console.log("Data  Source Created");
                        result.reason = "DataSource Created";
                        result.response = true
                    }
                }
            }else {
                console.log("Please provide valid schema");
                result.reason = "Invalid Schema";
                result.response = false
            }

        }
        res.send(result)
    }

    /**
     * @async
     * Represents a editDataSource.
     * @Function
     * @param {json} req - Request comming.
     * @param {json} res - Reponse.
     * @description - This function responsible to edit existing db with new schema
    */
    async editDataSource(req, res) {

        let dataSourceName = req.params.dsname  || false
        let response = { response: false, reason: 'notGiven'};
        if(dataSourceName){
            console.log(`Data Source Edit: ${dataSourceName}`);

            let conn = await promisifyDbConnection.promiseConnection(dataSourceName);
                       await dbPanel.dropCollection(conn, `${dataSourceName}_schema`);

            let saveRecord = false;

            let DynamicModel = createDynamicModel(conn, `${dataSourceName}_schema`);
            if (DynamicModel) {
                let newRecords = new DynamicModel(req.body);
                try {
                    saveRecord = await newRecords.save()
                } catch (e) {
                    response.reason = "error in saving"
                    console.error("Error in saving records");
                    console.error(e)
                }
            }

            if (saveRecord) {
                console.log("Record Saved!!");
                response.response = true
                response.reason = "updated data source schema"
            }
        } else {
            response.reason = "data source not found"
        }

        res.send(response)

    }
    
    /**
     * @async
     * Represents a editDataSource.
     * @Function
     * @param {json} req - Request.
     * @param {json} res - Reponse.
     * @description - This function responsible to fetch all database name from connection.
    */
    async get_list_ofsource(req, res) {
        let result = [];
        let conn = await promisifyDbConnection.promiseConnection("test");
        let collections = await dbPanel.getDbList(conn);
        collections.map(function (collection) {
            result.push(collection.name)
        });
        // console.log(result)
        // testBugger.informLog(`Here is data return ${result}`);
        res.send(result)
    }

    /**
     * @async
     * Represents a insert_data.
     * @Function
     * @param {json} req - Request comming.
     * @param {json} res - Reponse.
     * @description - This function responsible to insert data in db.
    */
    async insert_data(req, res) {

        let response = { response: false, reason: 'notGiven'};

        let dbFound = false
        let dataSourceName = req.params.dsname

        if(dataSourceName) {

            let conn = await promisifyDbConnection.promiseConnection(dataSourceName);
            let dbs = await dbPanel.getDbList(conn);
            dbs.map(function (db){
                if(dataSourceName == db.name){
                    dbFound = true
                }
            });

            if(dbFound){
                let result = await dbPanel.findQuery(conn, `${dataSourceName}_schema`)

                //parsing and validating payload
                let output = formatData(result, req.body)

                if (output['output'] != false){
                    Object.assign(output['output'], {"deleteflag":{
                            "deleted": "inserted"
                        }})
                    let new_data = {"database":dataSourceName,
                        "dataOBJ": output['output']
                    };
                    callback(new_data);
                    response.response = true
                    response.reason = "data parsed - "+output['message']
                }else{
                    // res.send(output)
                    testBugger.dangerLog("parsing and formeting failed")
                    response.reason = "parsing and validating failed - "+output['message']
                }
            }else{
                response.reason = "data source not found";
            }
        } else {
            response.reason = "data source not given"
        }
        res.send(response)
    }
}

/**
 * Represents a formatData.
 * @Function
 * @param {json} req - Request comming.
 * @param {json} res - Reponse.
 * @description - This function responsible to check proper format and parsing.
*/
function formatData(schema, request){
    schema  = schema["cursor"]["firstBatch"][0]
    delete schema['_id']
    delete schema['__v']
    delete schema['granularity']

    let isIt = isEqual(Object.getOwnPropertyNames(request).sort(), Object.getOwnPropertyNames(schema).sort())
   // console.log("asd",isIt)
    //console.log(Object.getOwnPropertyNames(request), Object.getOwnPropertyNames(schema))
    if (isIt == false){
      //  console.log("schema 1 does not match")
        return {message:"schema 1 does not match",output:false}
    }

    for(let i in schema){
        let itIt = isEqual(Object.getOwnPropertyNames(schema[i]).sort(),Object.getOwnPropertyNames(request[i]).sort())
        // console.log(Object.getOwnPropertyNames(schema[i]))
        // console.log(Object.getOwnPropertyNames(request[i]))
        // console.log("wfafs",itIt)
        if (!itIt){
            // console.log("schema does not match", schema[i])
            return {message:"schema does not match "+JSON.stringify(schema[i]),output:false}
        }
        for (let pro of Object.getOwnPropertyNames(schema[i])){
            // console.log(schema[i][pro])
            // console.log(request[i][pro])

            // console.log("PRO"+ schema[i][pro])
            switch (schema[i][pro]) {
                case "parseInt":
                    request[i][pro] =  parseInt(request[i][pro]) 
                    // console.log("asdsa",request[i][pro])
                    if (isNaN(request[i][pro])) request[i][pro] = 0
                    break;
                case "String":
                    // console.log(String(request[i][pro]))
                    request[i][pro] =  String(request[i][pro])
                    break;
                case "parseFloat":
                    // console.log(parseFloat(request[i][pro]))
                    request[i][pro] =  parseFloat(request[i][pro])
                    if (isNaN(request[i][pro])) {request[i][pro] = 0};
                        break;
                case "datetime":
                   console.log(" IN DATE")
                    var m = dateRegex.exec(request[i][pro]);

                    // console.log("DATE VALIDATION" + m[1])
                    if (m != null)
                    {
                    //    console.log("-------------",m[1])
                        var timestamp1=m[1];
                        request[i][pro] = new Date(timestamp1.replace(/</,"&lt;"))
                        // console.log("DATE TYPE" + request[i][pro])
                    }
                    else{
                        return {message:`${request[i][pro]} is having issue`,output:false}
                    }
                    break;
                default:
                    if (pro == "format"){
                        let formates = ["hourly","daily","weekly","fortnightly","monthly"]
                        // console.log("asdas",formates.includes(request[i][pro]))
                        if (!formates.includes(request[i][pro]))
                        {
                            // console.log("assadsdasdsafalse")
                            return {message:`date is having issue`,output:false}
                            break;
                        }
                    }        
            }
        }       
    }
    return {message:`success`,output:request}
}
module.exports = handler;