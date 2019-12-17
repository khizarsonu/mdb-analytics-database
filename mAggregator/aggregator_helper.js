"use strict";

const TestBugger = require('test-bugger');
const testBugger = new TestBugger({fileName: __filename});

/**
 * This class provides method which are responsible for 
 * all the aggregator functionaity
 **/
class aggregator_helper {

     /**
     * @async
     * Represents a custom_aggregator.
     * @Function
     * @param {json} RowDataModel - model of data collection.
     * @param {json} schemaStructure - structure of schema stored in schema collections.
     * @param {json} updateDeleteFlag - 'flag for change deleted flag.
     * @description - This function is for test aliveness of the api.
    */
    async custom_aggregator(RowDataModel, schemaStructure, updateDeleteFlag = true) {

        delete schemaStructure['_id'];
        delete schemaStructure['__v'];

        let d_temp = Object.getOwnPropertyNames(schemaStructure['dimensions']);
        let m_temp = Object.getOwnPropertyNames(schemaStructure['metrics']);

        let d_obj = {};
        let v_obj = {};

        d_temp.map((t) => {
            d_obj[t] = "$dimensions." + t;
            v_obj[t] = {"$first": "$dimensions." + t}
        });
        v_obj['time'] = {"$first": "$timestamp.date"};

        //  for granuality
        let format = null;
        try {
            format = schemaStructure.granularity.format
        } catch (e) {
            testBugger.errorLog("Error in getting format ");
            testBugger.errorLog(e)
        }

        if(format == "minutely"){
            d_obj['minutes'] = {
                "$minute": "$timestamp.date"
            },
            d_obj['hour'] = {
                "$hour": "$timestamp.date"
            },
            d_obj['dayOfYear'] = {
                "$dayOfYear": "$timestamp.date"
            },
            d_obj['week'] = {
                "$week": "$timestamp.date"
            },
            d_obj['year'] = {
                "$year": "$timestamp.date"
            }
        }
        else if (format == "hourly") {
            d_obj['hour'] = {
                "$hour": "$timestamp.date"
            },
            d_obj['dayOfYear'] = {
                "$dayOfYear": "$timestamp.date"
            },
            d_obj['week'] = {
                "$week": "$timestamp.date"
            },
            d_obj['year'] = {
                "$year": "$timestamp.date"
            }

        } else if (format == "daily") {
            d_obj['dayOfYear'] = {
                "$dayOfYear": "$timestamp.date"
            },
                d_obj['week'] = {
                    "$week": "$timestamp.date"
                },
                d_obj['year'] = {
                    "$year": "$timestamp.date"
                }
        } else if (format == "weekly") {
            d_obj['week'] = {
                "$week": "$timestamp.date"
            },
                d_obj['year'] = {
                    "$year": "$timestamp.date"
                }
        } else if (format == "yearly") {
            d_obj['year'] = {
                "$year": "$timestamp.date"
            }
        } else if (format == "fortnightly") {
            d_obj["interval"] = {
                "$subtract": [{"$week": "$timestamp.date"},
                    {"$mod": [{"$week": "$timestamp.date"}, 2]}]
            }
        }

        let m_obj = {};
        m_temp.map((t) => {
            m_obj[`${t}_total_`] = {"$sum": "$metrics." + t}
        });


        let main_obj = [];
        let match_obj = {
            "$match":
                {
                    "deleteflag.deleted": "processing"
                }
        };

        let temp_obj = {"_id": d_obj};
        Object.assign(temp_obj, m_obj);
        Object.assign(temp_obj, v_obj);
        let grp_obj = {"$group": temp_obj};

        main_obj.push(match_obj);
        main_obj.push(grp_obj);

        // main_obj = JSON.parse(JSON.stringify(main_obj));
        try {
            await RowDataModel.updateMany({"deleteflag": {"deleted": "inserted"}}, {$set: {"deleteflag": {"deleted": "processing"}}})
        } catch (e) {
            testBugger.errorLog("Error in update status inserted");
            testBugger.errorLog(e)
        }
        // console.log(JSON.stringify(main_obj))
        let aggregatedData = null;
        try {
            aggregatedData = await RowDataModel.aggregate(main_obj)
        } catch (e) {
            testBugger.errorLog("Error in aggregating");
            testBugger.errorLog(e)
        }

        if (updateDeleteFlag) {
            try {
                await RowDataModel.updateMany({"deleteflag": {"deleted": "processing"}}, {$set: {"deleteflag": {"deleted": "delete"}}})
            } catch (e) {
                testBugger.errorLog("Error in updating status processing");
                testBugger.errorLog(e)
            }
        }

        let finalObject = false;
        try {
            finalObject = aggregatedData.map((el) => {
                el.sign = JSON.stringify(el._id);
                delete el._id;
                return el
            })
        } catch (e) {
            testBugger.errorLog("Error in mapping agg data");
            testBugger.errorLog(e)
        }

        return finalObject
    }
}

module.exports = aggregator_helper;