'use strict';

const TestBugger = require('test-bugger'),
    testBugger = new TestBugger({fileName: __filename});
    
const BatchInsertion = require('./BatchInsertion')
let batchInsert = new BatchInsertion();
const projectConfig = require('./../../config/project.config');  
const timeOutneDB = projectConfig.neDB_conf.timeOut
const pathneDB = projectConfig.neDB_conf.path
const timeOutDuration = projectConfig.batch.timeOut;
const batchSize = projectConfig.batch.batch_size;
const fs = require('fs');


var Datastore = require('nedb')
    , db = new Datastore({ filename: __dirname + pathneDB, autoload: true });

/**
 * This class provides method which are responsible for consuming the messages that
 * comes under batch queue
 */
class BatchRoutin {
    constructor() {
        // testBugger.informLog(`Constrcuter executed`);
        this.dataStack = [];
        this.lastMsgObject = null;
        this.timeoutRunning = null;
        this.timer_add = null
        
    }

    /**
     * This method works as consumer for batch message queue
     * @param {object} msgObject Single message object
     * @return {Promise<void>}
     */
    async reception(msgObject) {

        let dataObject = null;

        try {
            dataObject = msgObject;
            this.lastMsgObject = msgObject
        } catch (err) {
            testBugger.errorLog(err)
        }

        try {
            this.dataStack.push(dataObject)
            this.timer_add = setTimeout(()=>{
                if(this.dataStack.length !=0) {
                    db.insert((this.dataStack), function (err, newDoc) {   
                        if (err){console.log(err)}
                        else { 
                            // console.log(newDoc)
                            console.log("insterted in nedb")
                        }
                    });
                }
            },timeOutneDB * 1000);
        } catch (err) {
            testBugger.errorLog(err)
        }
        
        if (this.dataStack.length >= batchSize) {
            await this.gulp();
            if (this.timeoutRunning) clearTimeout(this.timeoutRunning)
        } else {
            if (this.timeoutRunning) clearTimeout(this.timeoutRunning);
            let gulp = this.gulp.bind(this); // Its to mantain 'this' with the function
            this.timeoutRunning = this.getNewTimeOutRunning(gulp)
        }
    }

    /**
     * This method is responsible for triggering timeout if defined number of
     * messages are not received in given time then gulp method will anyway execute
     * @param fun
     * @return {number}
     */
    getNewTimeOutRunning(fun) {
        return setTimeout(fun, timeOutDuration * 60 * 1000)
    }

    /**
     * @async
     * @function
     * This method actually stores the batch of messages into the database
     * @return {Promise<void>}
     */
    async gulp() {


        if (this.dataStack.length > 0) {
            testBugger.startTimeLog("Batch Insertion");

            try {
                // Insert data in mongo
                // console.log("data inserted in mongo", this.dataStack);

                let db_count = 0
                db_count = await db.count({})
                
                if (db_count > this.dataStack.length){
                    
                    db.find({}, function (err, docs) {
                        if (!err){
                            this.dataStack.push(docs)
                        }
                    });
                }

                    try{
                        batchInsert.insert_batch(this.dataStack)    
                        this.dataStack = [];
                        db.remove({}, { multi: true }, async function (err, numRemoved) {
                            console.log("removed count", numRemoved )
                        });
                        clearTimeout(this.timer_add)
                        try{
                            let l = fs.unlinkSync(`${__dirname}/tmp`)
                        }catch(e){
                            testBugger.warningLog("file alrady deleted")
                        }

                    } catch(e){
                        console.log(e)
                    }

            } catch (err) {
                testBugger.errorLog(err)
            }
        }
    }

}

module.exports = BatchRoutin;