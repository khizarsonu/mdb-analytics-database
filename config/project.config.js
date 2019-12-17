'use strict';

const servicePort = 6262,
    domain = `localhost`,
    agg_port =  6363;

const config = {
    "servicePort": servicePort,
    "aggPort": agg_port,
    mongo : {dbURL: "mongodb://127.0.0.1:27017"},
    aggregator_loop : {timeOut: 2},
    neDB_conf: {
        timeOut: 5, // this is for neDB (in seconds)
        path: "/tmp"
    },
    batch : {
        timeOut: 1, // this is for batch scheduler (in minutes)
        batch_size: 2 
    },
    apiRoot : `http://${domain}:${servicePort}`,
    aggRoot : `http://${domain}:${agg_port}`,
    blacklist_ds : ["local", "admin", "test", "rtb_dev_testCase"]

};

module.exports = config;
