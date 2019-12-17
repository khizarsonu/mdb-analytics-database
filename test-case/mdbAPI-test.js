const expect = require('chai').expect;

const projectConfig = require('../config/project.config');
const rp = require('request-promise');

const TestBugger = require('test-bugger');
const testBugger = new TestBugger();


describe("MDB endpoint Test", ()=> {
    it('Aliveness Test',async ()=>{
        try{
            var result =  await rp('http://127.0.0.1:6262/alive')
        } catch(e){
            testBugger.errorLog("Error in test aliveness")
            testBugger.errorLog(e)
        }
        expect(result).equal('true')
        
    });
    
    it('Datasource Creation Test', async () => {
        var requestObject = {
            method: 'POST',
            uri: `http://127.0.0.1:6262/create-data-source/test`,
            body: {
                "dimensions": {
                    "account_id": "parseInt",
                    "user_id": "String",
                    "offer_id": "String",
                    "campaign_id": "String",
                    "eventid": "String",
                    "track1": "String",
                    "country": "String",
                    "os": "String",
                    "browser": "String",
                    "scrub": "String",
                    "adv_price": "String",
                    "pub_price": "String"
                },
                "metrics": {
                    "click": "parseInt",
                    "price": "parseFloat"
                },
                "granularity": {
                    "format": "hourly"
                },
                "timestamp": {
                    "date": "datetime"
                    
                }
            },
            json: true,
            headers: {"content-type": "application/json"}
        };
        try {
            var result = await rp(requestObject)
            console.log(result)
        } catch(e){
            testBugger.errorLog('Error in datasource creation')
            testBugger.errorLog(e)
        }
        // console.log(result)
        expect(result).to.equal(true)
    })

    it('Datasource name alrady taken test', async () => {
        var requestObject = {
            method: 'POST',
            uri: `http://127.0.0.1:6262/create-data-source/test`,
            body: {
                "dimensions": {
                    "account_id": "parseInt",
                    "user_id": "String",
                    "offer_id": "String",
                    "campaign_id": "String",
                    "eventid": "String",
                    "track1": "String",
                    "country": "String",
                    "os": "String",
                    "browser": "String",
                    "scrub": "String",
                    "adv_price": "String",
                    "pub_price": "String"
                },
                "metrics": {
                    "click": "parseInt",
                    "price": "parseFloat"
                },
                "granularity": {
                    "format": "hourly"
                },
                "timestamp": {
                    "date": "datetime"
                    
                }
            },
            json: true,
            headers: {"content-type": "application/json"}
        };
        try {
            var result = await rp(requestObject)
            console.log(result)
        } catch(e){
            testBugger.errorLog('Error in datasource creation')
            testBugger.errorLog(e)
        }
        // console.log(result)
        expect(result).to.equal(false)
    })

    it('Datasource Schema Edit test', async () => {
        var requestObject = {
            method: 'POST',
            uri: `http://127.0.0.1:6262/edit-data-source/test`,
            body: {
                "dimensions": {
                    "account_id": "parseInt",
                    "user_id": "String",
                    "offer_id": "String",
                    "campaign_id": "String",
                    "eventid": "String",
                    "track1": "String",
                    "country": "String",
                    "os": "String",
                    "browser": "String",
                    "scrub": "String",
                    "adv_price": "String",
                    "pub_price": "String"
                },
                "metrics": {
                    "click": "parseInt",
                    "price": "parseFloat"
                },
                "granularity": {
                    "format": "hourly"
                },
                "timestamp": {
                    "date": "datetime"
                    
                }
            },
            json: true,
            headers: {"content-type": "application/json"}
        };
        try {
            var result = await rp(requestObject)
            console.log(result)
        } catch(e){
            testBugger.errorLog('Error in datasource creation')
            testBugger.errorLog(e)
        }
        // console.log(result)
        expect(result).to.equal(true)
    })

    it('Data Insertion test', async () => {
        var requestObject = {
            method: 'POST',
            uri: `http://127.0.0.1:6262/insert-data-source/test`,
            body: {
                "dimensions": {
                    "account_id": "2",
                    "user_id": "5",
                    "offer_id": "5",
                    "campaign_id": "3",
                    "eventid": "ba",
                    "track1": "2",
                    "country": "ind",
                    "os": "asd",
                    "browser": "b",
                    "scrub": "b",
                    "adv_price": "54",
                    "pub_price": "5"
                },
                "metrics": {
                    "click": "5",
                    "price": "5.0"
                },
                "granularity": {
                    "format": "hourly"
                },
                "timestamp": {
                    "date":"2017-06-29T12:02:00Z"
                }
            },
            json: true,
            headers: {"content-type": "application/json"}
        };
        try {
            var result = await rp(requestObject)
            console.log(result)
        } catch(e){
            testBugger.errorLog('Error in data insertion')
            testBugger.errorLog(e)
        }
        // console.log(result)
        expect(result).to.equal("good to go")
    })
})