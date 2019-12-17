const TestBugger = require('test-bugger');
const testBugger = new TestBugger({fileName: __filename});

const createDynamicDB = require('../../helpers/createDynamicDB');
const createDynamicModel = require('../../helpers/createDynamicModel');

const DBPANEL = require('../../helpers/MongoDReaderPanel');
const dbPanel = new DBPANEL();

const config = require('../../config/project.config');
const dbURL = config.mongo.dbURL;

const aggregator_helper = require('../../mAggregator/aggregator_helper');
const aggr_helper = new aggregator_helper;

const promis_conn = require('../../dbConnection/promisify_connection');
let promisify = new promis_conn();

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
     * Represents a aggregator_fetch.
     * @Function
     * @param {json} req - Request comming.
     * @param {json} res - Reponse.
     * @description - This function responsible to fetch aggregation of segment database
     */
    async aggregator_fetch(req, res) {
        let dataSourceName = req.params.datasource || false;
        let allData = [];

        if (dataSourceName) {
            let realTimeFlag = req.body.realtime || false;

            let conn = null;
            try {
                conn = await promisify.promiseConnection(dataSourceName);
            } catch (e) {
                testBugger.errorLog("Error in connection promise");
                testBugger.errorLog(e)
            }
            let dimObj = {};
            let sagmentModel = createDynamicModel(conn, `${dataSourceName}_segment`);
            if (Object.keys(req.body).length != 0) {
                testBugger.warningLog("request aggregator with spacifice date and projection");
                let requestData = req.body;
                let dimensions = Object.getOwnPropertyNames(requestData["dimensions"]);
                // console.log(requestData)
                dimensions.map((dimension) => {
                    Object.assign(dimObj, {[dimension]: {"$in": requestData["dimensions"][dimension]}})
                });
                dimObj.time = {
                    "$gte": (new Date(requestData['date']['start'])),
                    "$lt": (new Date(requestData['date']["end"]))
                }
            } else {
                console.log("aggregator all without any query")
            }

            // console.log(dimObj)
            try {
                allData = await sagmentModel.find(dimObj);
                allData = allData.map(e => e._doc)
            } catch (e) {
                testBugger.errorLog("Error in getting Records");
                testBugger.errorLog(e)
            }
        } else {
            allData = "Please provide data-source name..!"
        }
        res.send(allData)
    }

    /**
     * @async
     * Represents a aggregator_fetch.
     * @Function  aggregator_fetch_realtime
     * @param {json} req - Request comming.
     * @param {json} res - Reponse.
     * @description - This function responsible to fatch realtime feed
     */
    async aggregator_fetch_realtime(req, res) {
        let dataSourceName = req.params.datasource || false;
        let allData = [];
        if (dataSourceName) {

            let conn = null;
            try {
                conn = await promisify.promiseConnection(dataSourceName);
            } catch (e) {
                testBugger.errorLog("Error in connection promise");
                testBugger.errorLog(e)
            }
            let sagmentModel = createDynamicModel(conn, `${dataSourceName}_segment`);
            try {
                allData = await sagmentModel.find({});
                allData = allData.map(e => e._doc)

            } catch (e) {
                testBugger.errorLog("Error in getting Records");
                testBugger.errorLog(e)
            }

            let DataModel = createDynamicModel(conn, `${dataSourceName}_data`);
            let result = null;

            let cursor = null;
            try {
                result = await dbPanel.findQuery(conn, `${dataSourceName}_schema`);
                cursor = result.cursor.firstBatch[0]
            } catch (e) {
                testBugger.errorLog("Error in findQuery Collection");
                testBugger.errorLog(e)
            }

            var agg_result = [];

            if (cursor) {
                try {
                    agg_result = await aggr_helper.custom_aggregator(DataModel, cursor, false)
                } catch (e) {
                    testBugger.errorLog("Error in custom aggregate");
                    testBugger.errorLog(e);
                    testBugger.informLog(agg_result.length)
                }
            }

            let tempKeys = [];
            testBugger.dangerLog(`AGG RESULT ${JSON.stringify(agg_result)}`);
            if (agg_result.length != 0) {
                tempKeys = Object.keys(agg_result[0]);
            }

            let regex = RegExp('_total_$');
            let metricsKey = [];
            for (let key of tempKeys) {
                if (regex.test(key)) {
                    metricsKey.push(key)
                }
            }

            for (let agRecord of agg_result) {

                let index = allData.findIndex(e => e.sign == agRecord.sign);

                testBugger.successLog(`INDEX ${index}`);
                if (index != -1) {
                    let changeObject = allData[index];
                    for (let key of metricsKey) {
                        changeObject[key] += agRecord[key]
                    }
                    testBugger.warningLog(JSON.stringify(changeObject));
                    allData.splice(index, 1, changeObject)
                } else {
                    allData.push(agRecord)
                }
            }
        } else {
            allData = "Please provide data-source name..!"
        }
        res.send(allData)

    }

    /**
     * @async
     * Represents a aggregator_query.
     * @Function
     * @param {json} req - Request comming.
     * @param {json} res - Reponse.
     * @description - This function responsible to create new db with two collection and inseted structure in schema
     */
    async aggregator_query(req, res) {
        let dataSourceName = req.params.datasource || "unknown";
        let allData = [];
        let projectionFlag = req.body;
        let projectionFlagtmp = JSON.parse(JSON.stringify(req.body));
        let conn = await promisify.promiseConnection(dataSourceName);
        let schema = await dbPanel.findQuery(conn, `${dataSourceName}_schema`);
        schema = schema["cursor"]["firstBatch"][0];

        let query_perams = Object.getOwnPropertyNames(projectionFlag['dimensions']);
        // console.log(result_schema)
        let project = projectionFlag['projection'];
        let schema_perams = Object.getOwnPropertyNames(schema['dimensions']);
        let main_obj = [];
        let group_obj = {};
        let project_obj = {};
        let id_obj = {};
        for (let i of schema_perams) {
            if (!query_perams.includes(i)) {
                let s = schema['dimensions'][i];
                let tmpValue;
                if (s == "String") {
                    tmpValue = "qwertyuiop"
                } else if (s == "parseInt") {
                    tmpValue = -9999999
                } else if (s == "parseFloat") {
                    tmpValue = -19999999.1
                }
                projectionFlag['dimensions'][i] = {'$ne': tmpValue}
            } else {
                projectionFlag['dimensions'][i] = {'$in': projectionFlag['dimensions'][i]}
            }
            Object.assign(project_obj, {[i]: 1})
        }
        Object.assign(project_obj, {"time":"$time"})

        if (Object.getOwnPropertyNames(projectionFlagtmp).includes("granularity")){
            let format_g = projectionFlagtmp['granularity']['format']
            if (format_g == "hourly") {
                Object.assign(id_obj, {
                    "hour": {"$hour": "$time"},
                    "day": {"$dayOfYear": "$time"},
                    "week": {"$week": "$time"},
                    "month": {"$month": "$time"},
                    "year": {"$year": "$time"}
                })
            } else if(format_g == "daily"){
                Object.assign(id_obj, {
                    "day": {"$dayOfYear": "$time"},
                    "week": {"$week": "$time"},
                    "month": {"$month": "$time"},
                    "year": {"$year": "$time"}
                })
            } else if(format_g == "weekly"){
                Object.assign(id_obj, {
                    "week": {"$week": "$time"},
                    "month": {"$month": "$time"},
                    "year": {"$year": "$time"}
                })
            } else if(format_g == "monthly"){
                Object.assign(id_obj, {
                    "month": {"$month": "$time"},
                    "year": {"$year": "$time"}
                })
            } else if(format_g == "yearly"){
                Object.assign(id_obj, {
                    "year": {"$year": "$time"}
                })
            }

        }
        if (Object.getOwnPropertyNames(projectionFlag).includes('date')) {
            projectionFlag['dimensions']['time'] = {
                "$gte": (new Date(projectionFlag['date']['start'])),
                "$lt": (new Date(projectionFlag['date']['end']))
            };
        // console.log(projectionFlag['dimensions']['time'])
        }


        let tmpdim = Object.getOwnPropertyNames(projectionFlagtmp['dimensions']);
        // console.log(tmpdim)

        tmpdim.map((dim) => {
            Object.assign(id_obj, {[dim]: "$" + [dim]})
        });
        project.map((projection) => {
            Object.assign(id_obj, {[projection]: "$" + [projection]})
        });
        // console.log(projectionFlag)
        let mtrics_perams = projectionFlag['metrics'];

        Object.assign(group_obj, {"_id": id_obj});
        mtrics_perams.map((metrix) => {
            Object.assign(project_obj, {[metrix + "_total_"]: 1});
            Object.assign(group_obj, {[metrix]: {"$sum": "$" + metrix + "_total_"}})
        });

        Object.assign(group_obj, {"date":{"$first":"$time"}})
        group_obj = {"$group": group_obj};
        project_obj = {"$project": project_obj};
        main_obj.push({"$match": projectionFlag['dimensions']});
        main_obj.push(project_obj);
        main_obj.push(group_obj);
        // console.log(JSON.stringify(main_obj))

        try {
            let sagmentModel = createDynamicModel(conn, `${dataSourceName}_segment`);
            allData = await sagmentModel.aggregate(main_obj)
            // console.log(allData)
        } catch (e) {
            testBugger.errorLog("data fetching error from segment");
            testBugger.errorLog(e)
        }
        res.send(allData)
    }
}

module.exports = handler;