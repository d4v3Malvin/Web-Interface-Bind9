const express = require('express')
const cors = require('cors')
const http = require('http')
const ws = require('ws')
const fs = require('fs')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const wss = new ws.Server({ server })

app.use(cors())

require('./Routes/routes') (app);

wss.on('connection', (ws) => {
    console.log('Client Connected')

    let output = ''

    const fileStream = fs.createReadStream(process.env.LOG_PATH);
    fileStream.on('data', (data) => {
        output += data.toString()
    });

    fileStream.on('end', () => {
        ws.send(output);
    })
    
})

server.listen(3000, () => {
    console.log("Bind DNS Backend listend on port 3000");
})