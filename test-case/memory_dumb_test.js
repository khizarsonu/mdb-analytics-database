'use strict'

const rp = require('request-promise')
//const testEndPoint = `${projectConfig.urls.innerRoot}/generic?token=${secrateDb.testToken}`

async function requestTest() {
     var testEndPoint = `http://127.0.0.1:6262/insert-data-source/test`
     var req = {
      "dimensions": {
          "account_id": "2",
          "user_id": "5",
          "offer_id": "5",
          "campaign_id": "parth",
          "eventid": "ad",
          "track1": "5",
          "country": "ind",
          "os": "asd",
          "browser": "b",
          "scrub": "b",
          "adv_price": "54",
          "pub_price": "4"
      },
      "metrics": {
          "click": "1",
          "price": "1.0"
      },
      "granularity": {
          "format": "hourly"
      },
      "timestamp": {
          "date":"2017-06-29T12:02:00Z"
      }
  }
    var requestObject = {        
        method: 'POST',
        uri: testEndPoint,
        body: req,
        json: true,
        headers: {
            'content-type': 'application/json',
        }
    }
    try {
        var result = await rp(requestObject)
        // if(result){
            console.log(result)
          //  console.log(JSON.stringify(result.headers['x-response-time"']))
          //  await rp(result.body.seatbid[0].bid[0].nurl)
        // }
    } catch (err) {
        console.log(err)
    }
}

(async function test() {
 
 let res = await rp('http://127.0.0.1:6262/alive')
 console.log(res)
for(let i=0 ; i<2; i++){
    await requestTest()
    console.log(i)
    // gH.sleep(2)
}
})()

