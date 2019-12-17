const expect = require('chai').expect;

const projectConfig = require('../config/project.config');
const rp = require('request-promise');

const TestBugger = require('test-bugger');
const testBugger = new TestBugger();

describe("Aggregator endpoint Test", ()=> {
    it('Aliveness Test',async ()=>{
        try{
            var result =  await rp('http://127.0.0.1:6262/alive')
        } catch(e){
            testBugger.errorLog("Error in test aliveness")
            testBugger.errorLog(e)
        }
        expect(result).equal('true')
        
    });

    


});
