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

wss.on('connection', (ws,req) => {
    const ip = req.socket.remoteAddress

    console.log(`Client ${ip} Connected / Reconnect`)

    let json_message = []

    const fileStream = fs.createReadStream(process.env.LOG_PATH);
    fileStream.on('data', (data) => {
        list_data = data.toString()
        let object = list_data.split('|')

        for(const value of object){
            let object = value.split(',')
            let log = {
                type: object[0].replace('\n',''),
                date: object[1],
                time: object[2],
                ip_source: object[3],
                domain: object[4],
                dns_type: object[5],
                note: object[6] || 'none'
            }
            json_message.push(log)
        }
    });

    fileStream.on('end', () => {
        ws.send(JSON.stringify(json_message));
    })
    
})

server.listen(3000, () => {
    console.log("Bind DNS Backend listend on port 3000");
})