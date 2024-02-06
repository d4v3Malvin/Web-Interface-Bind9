require('dotenv').config()
const { spawn, execSync } = require("child_process")

module.exports = function (app) {
    app.get('/', (req,res) => {
        res.send("hello")
    })

    app.get('/list-dns-block', (req,res) => {
        const data = execSync('/home/webScript/list_blocked_domain.sh')
        res.json(data.toString())
    })

    app.post('/add-dns-block', (req,res) => {
        var { domain, type } = req.body;
        var dns_type = type === 'ads' ? 'db.ads.rpz' : 'db.blocked.rpz'
        const output = execSync('/home/webScript/add_domain.sh '+ dns_type + ' ' + domain)
        res.json(output.toString())
    })

    app.get('/get-dns-traffic', (req,res) => {
        const process = spawn('/home/webScript/extract_log.sh', ['/home/back_api/dns-log'])
        process.stdout.on('end', (data) => {
            res.json("log sudah diambil")
        })
    })

    app.get('/get-dns-cache', (req,res) => {
        let datalist = ""
        let ifdomain = "unknown"
        let jsonmessage = {
            size: 0,
            cache: []
        }
        const cachelist = execSync('/home/webScript/extract_dns_cache.sh')

        datalist = cachelist.toString()
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
                        address = arrayofvalue[5].split('=')[1]
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

        const size = execSync('du -sh /var/log/bind/cache_dump.db')

        jsonmessage.size = size.toString().split('\t')[0]

        res.json(jsonmessage)
    })

    app.get('/flush-cache', (req,res) => {
        const cachelist = execSync('rndc flush')
        res.send("cache sudah terhapus")
    })
}
