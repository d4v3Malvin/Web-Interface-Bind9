const fs = require('fs')
const { execSync } = require("child_process")

const readerStream = fs.createReadStream('/var/log/bind/query.log')
readerStream.setEncoding('utf8')

let dump = []

readerStream.on('data', (chunk) => {
    let datas = chunk.split('\n')

    datas = datas.filter(data => data.length > 0)

    for (const data of datas){
        let array_values = data.split(' ')
        let type = array_values[2].toString().replace(':','')
        let date = array_values[0].toString()
        let time = array_values[1].split('.')[0].toString()
        let client_ip = array_values[6].split('#')[0].toString()
        let query = ""
        let record = ""
        let message = ""
        if (type == "queries"){
            query = array_values[9].toString()
            record = array_values[11].toString()
            message = "Query are healthy"
        }
        else if (type == "query-errors"){
            let temp = array_values[12].toString().split('/')
            query = temp[0].toString()
            record = temp[2].toString()
            message = data.split(':')[5].split('for')[0]
        }
        else if (type == "rpz"){
            let temp = array_values[12].split('/')
            query = temp[0].toString()
            record = temp[1].toString()
            message = data.split(":")[5].toString()
        }

        let log = {
            type: type,
            date: date,
            time: time,
            ip_source: client_ip,
            domain: query,
            dns_type: record,
            note: message
        }
        dump.push(log)
    }
})

readerStream.on('end', () => {
    db = connect('mongodb://localhost:27017/web-interface-bind9')
    db['dns-log'].insertMany(dump)
    execSync('sudo truncate -s 0 /var/log/bind/query.log')
})