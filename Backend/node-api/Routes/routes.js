require('dotenv').config()
const { spawn, execSync, execFileSync } = require("child_process")
const StringDecoder = require('string_decoder').StringDecoder

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

    app.get('/get-top-query/:type/:time', (req,res) => {
        const top_type = req.params.type
        const time = req.params.time

        var decoder = new StringDecoder('utf8')

        const result = execFileSync('/home/webScript/Top_Query_list.sh', [process.env.LOG_PATH,top_type,time])

        let datalist = decoder.write(result).trim()

        if (datalist.length > 0){
            const cleaned = datalist.split("\n")

            let querys = []

            for (const value of cleaned){
                let query = value.trim().split(' ')
                let querysatuan = {
                    count: query[0],
                    domain: query[1] || ""
                }
                querys.push(querysatuan)
            }
            querys = querys.sort((a,b) => b.count - a.count)

            let top10 = []

            for (let i = 0; i < querys.length && i < 10; i++) {
                top10.push(querys[i])
            }

            res.json(top10)
        }
        else{
            res.json([])
        }
    })

    app.get('/get-top-client/:time', (req,res) => {
        const time = req.params.time

        var decoder = new StringDecoder('utf8')

        const result = execFileSync('/home/webScript/Top_Client_list.sh', [process.env.LOG_PATH,time])
        
        let datalist = decoder.write(result).trim()

        if (datalist.length > 0){
            const cleaned = datalist.split("\n")

            let querys = []

            for (const value of cleaned){
                let query = value.trim().split(' ')
                let querysatuan = {
                    count: query[0],
                    ip: query[1] || ""
                }
                querys.push(querysatuan)
            }

            querys = querys.sort((a,b) => b.count - a.count)

            let top10 = []

            for (let i = 0; i < querys.length && i < 10; i++) {
                top10.push(querys[i])
            }

            res.json(top10)
        }
        else{
            res.json([])
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
    app.post('/login', (req,res) => {
        var { username, password } = req.body
        let code = 0
        let message = ""
        const result = execSync('cat /home/back_api/login_cred')
        var decoder = new StringDecoder('utf8')
        let array = decoder.write(result).split('\n')
        if (atob(atob(array[0])).trim() == username.trim()) {
            if(atob(atob(array[1])).trim() == password.trim()) {
                code = 200
                message = "Success Login"
            }
            else{
                code = 400
                message = "Password is not correct"
            }
        }
        else{
            code = 300
            message = "Username is not correct"
        }

        const jsonmessage = {
            code: code,
            message: message
        }

        res.json(jsonmessage)
    })

    app.post('/change-password', (req,res) => {
        var { old_pass, new_pass, confirm_pass } = req.body
        let code = 0
        let message = ""
        var decoder = new StringDecoder('utf8')
        if (new_pass.toLowerCase() != "admin"){
            let old_password = execSync('tail -n 1 /home/back_api/login_cred | base64 -d | base64 -d')
            if (old_pass.trim() == decoder.write(old_password).trim()){
                if (new_pass == confirm_pass){
                    const result = execFileSync('/home/webScript/Change_password.sh', [old_pass,new_pass])
                    code = 200
                    message = decoder.write(result)
                }
                else{
                    code = 412
                    message = "New Password are different than Confirm Password."
                }
            }
            else{
                code = 401
                message = "Wrong Old Password."
            }
        }
        else{
            code = 411
            message = "New Password Cant be this."
        }

        const jsonmessage = {
            code: code,
            message: message
        }

        res.json(jsonmessage)
    })
}