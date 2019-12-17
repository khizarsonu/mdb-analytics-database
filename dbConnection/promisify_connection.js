const config = require('../config/project.config');
const dbURL = config.mongo.dbURL;

const dbConnectionMaker = require('./dbConnection');

class promise_conn { 
    promiseConnection(collectionName) {
        return new Promise((resolve) => {
            let conn = dbConnectionMaker(`${dbURL}/${collectionName}`);
            conn.on("open", () => {
                resolve(conn)
            })
        })
    }
}

module.exports = promise_conn