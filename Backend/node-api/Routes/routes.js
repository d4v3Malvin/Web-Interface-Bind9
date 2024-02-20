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
    
    app.get('/delete-dns-block/:domain' ,(req,res) => {
        const { type } = req.query
        const domain = req.params.domain
        var dns_type = type === 'ads' ? 'db.ads.rpz' : 'db.blocked.rpz'
        const output = execSync('/home/webScript/remove_domain_block.sh /etc/bind/' + dns_type + ' ' + domain)
        res.json(output.toString().split('\n')[0] + " from " + type)
    })

    app.get('/get-dns-traffic', (req,res) => {
        const process = spawn('/home/webScript/extract_log.sh', ['/home/back_api/dns-log'])
        process.stdout.on('end', (data) => {
            res.json("log sudah diambil")
        })
    })

    app.get('/get-top-query', (req,res) => {
        const output = execSync('/home/webScript/get_top_query.sh ' + process.env.LOG_PATH + " 10 all")
        let datalist = output.toString().trim()
        const cleaned = datalist.split("\n")

        let querys = []

        for (const value of cleaned){
            let query = value.trim().split(' ')
            let querysatuan = {
                count: query[0],
                domain: query[1]
            }
            querys.push(querysatuan)
        }
        res.json(querys)
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

    app.get('/get-ip-block', (req,res) => {
        const output = execSync('/home/webScript/get_list_blocked_ip.sh')
        const cleaned = output.toString().trim().split('\n')

        let ips = []

        for (const value of cleaned){
            let ip = value.replace('\t','')
            ip = ip.replace(';','')
            ips.push(ip)
        }
        res.json(ips)
    })

    app.post('/add-ip-block', (req,res) => {
        var { ip, blocks } = req.body;
        var ip_address = ip + '/' + blocks + ";"
        const output = execSync('/home/webScript/add_client.sh '+ ip_address)
        res.json(output.toString())
    })

    app.get('/delete-ip-block/:ip' ,(req,res) => {
        const { block } = req.query
        const ip = req.params.ip
        let ips = ip + "/" + block
        const output = execSync('/home/webScript/delete_client.sh ' + ips)
        res.json(output.toString())
    })

    app.get('/flush-cache', (req,res) => {
        execSync('rndc flush')
        res.send("cache sudah terhapus")
    })
}