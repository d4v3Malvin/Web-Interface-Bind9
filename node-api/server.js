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

            var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

            let waktu = new String(object[2])
            let times = waktu.split(':')
            let tanggal = new String(object[1]).split('-')
            let date = new Date()
            date.setUTCMonth(months.indexOf(String(tanggal[1]).toLowerCase()),tanggal[0])
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
                type: object[0].replace('\n',''),
                date: datetime[0],
                time: time[0] + ":" + time[1] + ":" + time[2],
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