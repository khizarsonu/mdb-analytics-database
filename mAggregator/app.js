const config = require('../config/project.config');


const timeOut = config.aggregator_loop.timeOut;
const dbURL = config.mongo.dbURL;

var blocklistDB = config.blacklist_ds;
const DBPANEL = require('./../helpers/MongoDReaderPanel');
const dbPanel = new DBPANEL();

const aggregator_helper = require('./aggregator_helper');
const aggr_helper = new aggregator_helper;

const createDynamicModel = require('./../helpers/createDynamicModel');


const TestBugger = require('test-bugger');
const testBugger = new TestBugger({'fileName': __filename});

const promis_conn = require('../dbConnection/promisify_connection');
let promisify = new promis_conn();

/**
 * @async
 * Represents a callbackfun.
 * @Function
 * @description - This function is responsible of calling aggregaters and store in segment collections.
 */
async function callbackfun() {

    let result = [];
    try {
        let conn = await promisify.promiseConnection("test");
        var dbNameLists = await dbPanel.getDbList(conn);
    } catch (e) {
        testBugger.errorLog("Error in Connecting")
    }

    dbNameLists.map(async function (db) {
        if (!blocklistDB.includes(db.name)) {
            let conn = null;
            try {
                conn = await promisify.promiseConnection(db.name);
            } catch (e) {
                testBugger.errorLog("Error in connection promise");
                testBugger.errorLog(e)
            }

            let result = null;
            let cursor = null;
            try {
                result = await dbPanel.findQuery(conn, `${db.name}_schema`);
                cursor = result.cursor.firstBatch[0]
            } catch (e) {
                testBugger.errorLog("Error in findQuery Schema Collection");
                testBugger.errorLog(e)
            }

            let RowDataModel = null;
            try {
                RowDataModel = await createDynamicModel(conn, `${db.name}_data`);
            } catch (e) {
                testBugger.errorLog("Error in Row Data Model generating");
                testBugger.errorLog(e)
            }

            testBugger.startTimeLog("aggragating");
            var agg_result = [];
            if (cursor) {
                try {
                    agg_result = await aggr_helper.custom_aggregator(RowDataModel, cursor)
                } catch (e) {
                    testBugger.errorLog("Error in custom aggregate");
                    testBugger.errorLog(e);
                }
            } else {
                return false
            }
            testBugger.endTimeLog("aggragating");

            if (agg_result.length != 0) {
                let segmentModel = null;
                try {
                    segmentModel = await createDynamicModel(conn, `${db.name}_segment`);
                } catch (e) {
                    testBugger.errorLog("Error in creating segment model");
                    testBugger.errorLog(e)
                }
                let tempKeys = [];
                tempKeys = Object.keys(agg_result[0]);

                testBugger.startTimeLog("upsert segment");
                for (let record of agg_result) {
                    let incObject = {};
                    let setObject = {};
                    var regex = RegExp('_total_$');

                    for (let key of tempKeys) {
                        if (regex.test(key)) {
                            Object.assign(incObject, {[key]: `${record[key]}`})
                        } else {
                            Object.assign(setObject, {[key]: `${record[key]}`})
                        }
                    }
                    setObject.time = new Date(setObject.time);
                    try {
                        let res = await segmentModel.update({"sign": record.sign}, {
                            $set: setObject,
                            $inc: incObject
                        }, {upsert: true});

                        // check for index
                        if (res) {
                            let index = await segmentModel.collection.getIndexes();
                            index = Object.keys(index).length;
                            if (index > 1) {
                                testBugger.errorLog("index is alrady created.")
                            } else {
                                await segmentModel.collection.createIndex({"sign": 1}, {name: "segment_index"})
                            }

                        }


                    } catch (e) {
                        testBugger.errorLog("Error in Upserting Sagment Record");
                        testBugger.errorLog(e)
                    }
                }
                testBugger.endTimeLog("upsert segment")
            }
        }
    });
}

/**
 * @async
 * Represents a anonymouse.
 * @Function
 * @description - This function is entry point for aggregators, and run after interval.
 */
setInterval(async () => {
    testBugger.informLog("aggregation loop call");
    await callbackfun();
}, timeOut * 1000);//timeOut * 60 * 1000


