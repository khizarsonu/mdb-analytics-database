'use strict';

const projectConfig = require('./../config/project.config');
const TestBugger = require('test-bugger');
const testBugger = new TestBugger({fileName:__filename});

const rp = require('request-promise');
let counter = 0;
let requestTestURL = projectConfig.apiRoot
// console.log(requestTestURL)

async function requestTest() {
    var requestObject = {
        method: 'GET',
        uri: `${requestTestURL}/list-data-source`,
    };
    // console.log("dgdg")
    try {        
        var result = await rp(requestObject);
        } catch (err) {
        console.log(err)
    }
}

(async function test() {
    for (let i = 0; i < 50; i++) {
        console.time("time");
        await requestTest()
        console.timeEnd("time"); 
    }
})();