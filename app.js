'use strict'

const express = require('express')
const app = express()


const projectConfig = require('./config/project.config')

const router = require('./router')

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded(
    {extended: true}
));
app.use(bodyParser.json());


app.use("/",router);

app.listen(projectConfig.servicePort, ()=>{
    console.log(`Server Listen on ${projectConfig.servicePort} ...`)
})