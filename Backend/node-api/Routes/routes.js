require('dotenv').config()
const { spawn, execSync, execFileSync } = require("child_process")
const { MongoClient } = require("mongodb")
const fs = require('fs')
const { changeDateToIndo } = require('../Modules/change_date')
const { getAllLog, getEpochLog, getallpage, getCountAll } = require('../Modules/get_all')
const e = require('express')
const logpath = process.env.LOG_PATH
const mongo_uri = 'mongodb://localhost:27017'
const StringDecoder = require('string_decoder').StringDecoder

const client = new MongoClient(mongo_uri);

module.exports = function (app) {
    app.get('/', (req,res) => {
        res.send("This is Test API")
    })

    app.get('/list-dns-block', (req,res) => {
        const data = execSync('/home/webScript/Blocked_Domain_list.sh')
        var decoder = new StringDecoder('utf8')
        let list = decoder.write(data).split('\n')
        list = list.filter(value => Object.keys(value).length > 0)
        res.json(list)
    })

    app.post('/add-dns-block', (req,res) => {
        var { domain, type, record } = req.body;
        var dns_type = type === 'ads' ? 'db.ads.rpz' : 'db.blocked.rpz'
        const data = execSync('/home/webScript/Blocked_Domain_add.sh '+ dns_type + ' ' + domain + ' ' + record)
        var decoder = new StringDecoder('utf8')
        res.json(decoder.write(data))
    })
    
    app.get('/delete-dns-block/:domain' ,(req,res) => {
        const { type, record } = req.query
        const { domain } = req.params
        var dns_type = type === 'ads' ? 'db.ads.rpz' : 'db.blocked.rpz'
        const data = execSync('/home/webScript/Blocked_Domain_delete.sh /etc/bind/' + dns_type + ' ' + domain + ' ' + record)
        var decoder = new StringDecoder('utf8')
        res.json(decoder.write(data).split('\n')[0] + " from " + type)
    })

    app.get('/get-dns-traffic', (req,res) => {
        const process = spawn('/home/webScript/Dns_Log_list.sh', ['/home/back_api/dns-log'])
        process.stdout.on('end', (data) => {
            res.json("log sudah diambil")
        })
    })

    app.get('/get-dns-log/:page/:query', async (req,res) => {
        try {
            client.connect()

            let data = await getallpage(client,req.params.page,req.params.query)
            
            res.json(data)
        } catch (error) {
            console.error(error)
        } finally {
            client.close()
        }
    })

    app.get('/get-count', async (req,res) => {
        try {
            client.connect()

            let data = await getCountAll(client)

            let jumlah = {
                count: data
            }
            
            res.json(jumlah)
        } catch (error) {
            console.error(error)
        } finally {
            client.close()
        }
    })

    app.get('/extract-log', (req,res) => {

        let dump = []
        let code = 0
        let message = ""

        let log_count = execSync('sudo wc -l /var/log/bind/query.log')

        log_count = log_count.toString().split(' ')

        if (log_count != "0"){
            execSync('sudo cp /var/log/bind/query.log /var/log/bind/temp_query.log')
            execSync('sudo truncate -s 0 /var/log/bind/query.log')

            const readerStream = fs.createReadStream('/var/log/bind/temp_query.log')
            readerStream.setEncoding('utf8')

            readerStream.on('data', (chunk) => {
                let datas = chunk.split('\n')
            
                datas = datas.filter(data => data.length > 0)
            
                for (const data of datas){
                    let array_values = data.split(' ')
                    let type = array_values[2].toString().replace(':','')
                    let date = array_values[0].toString()
                    let time = array_values[1].split('.')[0].toString()

                    let datetimes = changeDateToIndo(date,time)

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
                        date: new Date(datetimes),
                        ip_source: client_ip,
                        domain: query,
                        dns_type: record,
                        note: message
                    }
                    dump.push(log)
                }
            })

            readerStream.on('end', async () => {
                if (dump.length > 0){
                    try {
                        client.connect()
                        
                        const db = client.db("web-interface-bind9")
                        const log_collection = db.collection("dns-log")

                        const result = await log_collection.insertMany(dump, { ordered: true })

                        code = 200
                        message = `Extraction Success, ${result.insertedCount} Lines inserted`

                    } catch (error) {
                        code = 500
                        message = "Extraction Fail, the error message is " + error
                    }
                    finally {
                        client.close()
                    }
                }
                else{
                    code = 201
                    message = `No Data on Log`
                }

                res.json({
                    code: code,
                    message: message
                })
            })
        }
        else{
            res.json({
                code: 200,
                message: "no Data to be extracted"
            })
        }
        
    })

    app.get('/get-top-query/:type/:time', async (req,res) => {

        const time = req.params.time
        const type = req.params.type

        try {
            client.connect()

            let filtered = await getEpochLog(client,type,time)

            let unique = [] 

            filtered.forEach(data => {         
                if (!unique.includes(data.domain)){
                    unique.push((data.domain))
                }      
            });

            let count_collection = []

            unique.forEach(data => {
                let count = filtered.filter(row => row.domain == data).length
                let count_item = {
                    domain: data,
                    count: count
                }
                count_collection.push(count_item)
            })
            
            res.json(count_collection.sort((a,b) => b.count - a.count).slice(0,10))
            
        } catch (error) {
            console.error(error)
        } finally {
            client.close()
        }
    })

    app.get('/get-top-client/:time', async (req,res) => {
        const time = req.params.time

        try {
            client.connect()

            let filtered = await getEpochLog(client,"all",time)

            let unique = [] 

            filtered.forEach(data => {         
                if (!unique.includes(data.ip_source)){
                    unique.push(data.ip_source)
                }      
            });

            let count_collection = []

            unique.forEach(data => {
                let count = filtered.filter(row => row.ip_source == data).length
                let count_item = {
                    ip: data,
                    count: count
                }
                count_collection.push(count_item)
            })
            
            res.json(count_collection.sort((a,b) => b.count - a.count).slice(0,10))
            
        } catch (error) {
            console.error(error)
        } finally {
            client.close()
        }
    })

    app.get('/get-dns-cache', (req,res) => {
        let datalist = ""
        let ifdomain = "unknown"
        let jsonmessage = {
            size: 0,
            cache: []
        }
        const cachelist = execSync('/home/webScript/Dns_Cache_list.sh')

        var decoder = new StringDecoder('utf8')

        datalist = decoder.write(cachelist)
        const separatedstring = datalist.split("\n")

        for (const value of separatedstring){
            if (value.toString().length > 0){
                let valuereplaced = value.replace(/\t/g," ")
                valuereplaced = valuereplaced.replace("  "," ")
                let arrayofvalue = valuereplaced.toString().split(' ')
                let first = arrayofvalue[0].toString()
                let address = ""
                let requestType = ""
                let ttl = ""

                if(isNaN(first)){
                    ifdomain = first
                    ttl = arrayofvalue[1].toString()
                    requestType = arrayofvalue[2].toString()
                    address = arrayofvalue[3].toString()
                }
                else{
                    ttl = arrayofvalue[0].toString()
                    requestType = arrayofvalue[1].toString()
                    if (requestType == "HTTPS"){
                        if (arrayofvalue[3] == '.'){
                            address = '.'
                        }
                        else{
                            address = arrayofvalue[5].split('=')[1]
                        }
                    }
                    else{
                        address = arrayofvalue[2].toString()
                    }
                }

                let jsonsatuan = {
                    domain: ifdomain,
                    ttl: ttl,
                    type: requestType,
                    address: address
                }

                jsonmessage.cache.push(jsonsatuan)
                
            }
        }

        const size = execSync('/home/webScript/Memory_Dns_list.sh')

        if (size / 1000 > 1){
            if (size / 1000000 > 1){
                if (size / 1000000000 > 1){
                    jsonmessage.size = size / 1000000000 + " gb"
                }
                else{
                    jsonmessage.size = size / 1000000 + " mb"
                }
            }
            else{
                jsonmessage.size = size / 1000 + " kb"
            }
        }
        else {
            jsonmessage.size = size + " b"
        }

        res.json(jsonmessage)
    })

    app.get('/get-rrl-setting', (req,res) => {
        const output = execSync('/home/webScript/Rate_Limit_setting_list.sh')
        var decoder = new StringDecoder('utf8')        
        const cleaned = decoder.write(output).trim()

        let setting = []

        if (decoder.write(output) != ''){
            let temp = cleaned.split(' ')

            let setup = {
                setting: temp[0],
                value: temp[1].replace(';','')
            }
            setting.push(setup)
        }

        res.json(setting)
    })

    app.get('/set-rrl-setting', (req,res) => {
        const { limit } = req.query

        const result = execFileSync('/home/webScript/Rate_Limit_setting_update.sh', [limit])

        var decoder = new StringDecoder('utf8')

        res.json(decoder.write(result))
    })

    app.get('/get-ip-block', (req,res) => {
        const output = execSync('/home/webScript/Allow_Client_list.sh')
        var decoder = new StringDecoder('utf8')        
        const cleaned = decoder.write(output).trim().split('\n')

        let ips = []

        if (decoder.write(output) != ''){
            for (const value of cleaned){
                let ip = value.replace('\t','')
                ip = ip.replace(';','')
                ips.push(ip)
            }
        }

        res.json(ips)
    })

    app.post('/add-ip-block', (req,res) => {
        var { ip, blocks } = req.body;
        var ip_address = ip + '/' + blocks + ";"
        const output = execSync('/home/webScript/Allow_Client_add.sh '+ ip_address)
        var decoder = new StringDecoder('utf8')
        res.json(decoder.write(output))
    })

    app.get('/delete-ip-block/:ip' ,(req,res) => {
        const { block } = req.query
        const ip = req.params.ip
        let ips = ip + "/" + block + ";"
        const output = execSync('/home/webScript/Allow_Client_delete.sh ' + ips)
        var decoder = new StringDecoder('utf8')
        res.json(decoder.write(output))
    })

    app.get('/flush-cache', (req,res) => {
        execSync('rndc flush')
        res.send("cache sudah terhapus")
    })
    app.post('/login', async (req,res) => {
        var { username, password } = req.body
        let code = 0
        let message = ""

        try {
            client.connect()

            const db = client.db("web-interface-bind9")
            const users = db.collection("user")

            if (await users.countDocuments({ username: username }) <= 0){
                code = 300
                message = "Username is not correct"
            }
            else {
                let cursor = await users.find({ username: username }).toArray()

                let pass = btoa(btoa(password))

                console.log(cursor[0].password + " " + pass)

                if (cursor[0].password == pass){
                    code = 200
                    message = "Success Login"
                }
                else{
                    code = 400
                    message = "Password is not correct"
                }
            }

        } 
        catch (error) {
            console.error(error)
        }
        finally {
            const jsonmessage = {
                code: code,
                message: message
            }
            client.close()
            res.json(jsonmessage)
        }
    })

    app.post('/change-password', async (req,res) => {
        var { old_pass, new_pass, confirm_pass } = req.body
        let code = 0
        let message = ""

        try {
            client.connect()

            const db = client.db("web-interface-bind9")
            const users = db.collection("user")

            let cursor = await users.find({ username: "admin" }).toArray()

            if (cursor[0].password == btoa(btoa(old_pass))){
                if (new_pass != old_pass){
                    if (new_pass == confirm_pass){
                        let new_enc = btoa(btoa(new_pass))
                        let result = await users.updateOne({ username: "admin" }, { $set: { password : new_enc } })
    
                        if (result.modifiedCount > 0 ){
                            code = 200
                            message = "Password Changed Successfully."
                        }
                        else {
                            code = 500
                            message = "There is Error when updating data."
                        }
                    }
                    else{
                        code = 412
                        message = "New Password are different than Confirm Password."
                    }
                }
                else{
                    code = 413
                    message = "New Password cant be same as old password."
                }
            }
            else {
                code = 401
                message = "Wrong Old Password."
            }
        } 
        catch (error) {
            console.error(error)
        }
        finally {
            client.close()
            const jsonmessage = {
                code: code,
                message: message
            }
    
            res.json(jsonmessage)
        }
    })
}