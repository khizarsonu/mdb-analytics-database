'use strict';

var express = require('express');
var router = express.Router();

const handler = require('../handler/main_handler');
const Handler = new handler();

router.get('/', function (req, res) {
    res.send('connection success...!')
});

// Following are all routes of API with their respective functions
router.get('/alive', Handler.alive);
router.post('/create-data-source/:datasource', Handler.createDataSource);
router.post('/edit-data-source/:dsname', Handler.editDataSource);
router.post('/insert-data-source/:dsname', Handler.insert_data)
router.get('/list-data-source', Handler.get_list_ofsource);
router.all('*', (req,res) =>{ 
    res.status(502).send('BAD_GATEWAY')
})

module.exports = router;