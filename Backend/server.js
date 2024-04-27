const express = require('express')
const cors = require('cors')
const http = require('http')
const bodyParser = require('body-parser')
require('dotenv').config({path:'/home/back_api/.env'})

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

require('./Routes/routes') (app);

server.listen(3000, () => {
    console.log("Bind DNS Backend listend on port 3000");
})