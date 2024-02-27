const express = require('express')
const cors = require('cors')
const http = require('http')
const ws = require('ws')
const fs = require('fs')
const StringDecoder = require('string_decoder').StringDecoder
const bodyParser = require('body-parser')
require('dotenv').config({path:'/home/back_api/.env'})

const app = express()
const server = http.createServer(app)
const wss = new ws.Server({ server })
const logpath = process.env.LOG_PATH

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

require('./Routes/routes') (app);

wss.on('connection', (ws,req) => {
    const ip = req.socket.remoteAddress

    console.log(`Client ${ip} Connected / Reconnect`)

    let json_message = []

    const fileStream = fs.createReadStream(logpath);
    fileStream.on('data', (data) => {
        var decoder = new StringDecoder('utf8')
        
        if (data != ""){
            list_data = decoder.write(data)
            let object = list_data.split('|')

            for(const value of object){

                let object = value.split(',')

                let waktu = new String(object[2])
                let times = waktu.split(':')
                let tanggal = String(object[1]).split('-')
                let date = new Date()
                // since januari are count as 0
                date.setUTCMonth(tanggal[1]-1,tanggal[0])
                date.setUTCFullYear(tanggal[2])
                date.setUTCHours(times[0],times[1],times[2])
                let datetime = date.toLocaleDateString('ID', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Jakarta',
                    hour12: false,
                }).toString().split(',')

                let time = String(datetime[1]).split('.')

                let log = {
                    type: object[0].replace('\n','').toString(),
                    date: datetime[0].toString(),
                    time: time[0] + ":" + time[1] + ":" + time[2],
                    ip_source: String(object[3]),
                    domain: String(object[4]),
                    dns_type: String(object[5]),
                    note: object[6] || 'none'
                }
                json_message.push(log)
            }

            json_message = json_message.filter(data => data.type.length > 0)
        }
    });

    fileStream.on('end', () => {
        ws.send(JSON.stringify(json_message));
    })
    
})

server.listen(3000, () => {
    console.log("Bind DNS Backend listend on port 3000");
})