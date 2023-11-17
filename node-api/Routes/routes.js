require('dotenv').config()
const { spawn } = require("child_process")

module.exports = function (app) {
    app.get('/', (req,res) => {
        res.send("hello")
    })

    app.get('/Download/:filename', (req,res) => {
        const filename = req.params.filename
        const filepath = `/var/log/bind/${filename}`
        res.download(filepath, (err) => {
            if (err) {
                console.error(err)
                res.status.send(500).send(err)
            }
        })
    })

    app.get('/list-dns-block', (req,res) => {
        const process = spawn('/home/webScript/list_blocked_domain.sh')
        process.stdout.on('data',(data) => {
            res.json(data.toString())
        })
    })

    app.get('/get-dns-traffic', (req,res) => {
        const process = spawn('/home/webScript/extract_log.sh', ['/home/back_api/dns-log'])
        process.stdout.on('end', (data) => {
            res.json("log sudah diambil")
        })
    })

    app.get('/get-dns-cache', (req,res) => {
        let datalist = ""
        const process = spawn('/home/webScript/extract_dns_cache.sh')

        let ifdomain = ""

        process.stdout.on('data', (data) => {
            datalist = data.toString()
            const separatedstring = datalist.split("\n")
            let jsonmessage = {}

            for (const value of separatedstring){
                if (value.toString().length > 0){
                    let valuereplaced = value.replace(/\t/g," ")
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
                    
                    // console.log("start with : " + ifdomain)
                    // console.log("value : " + value.toString())
                    console.log(ifdomain + " " + ttl + " " + requestType + " " + address)
                }
            }
        })

        process.stdout.on('end', (data) => {
            res.json("test done")
        })
    })
}
