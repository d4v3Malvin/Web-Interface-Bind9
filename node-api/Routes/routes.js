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
        let output = '';
        process.stdout.on('data',(data) => {
            res.json(data.toString())
        })
    })

    app.get('/get-dns-traffic', (req,res) => {
        // /home/webScript/extract_log.sh /home/back_api/dns-log
        const process = spawn('/home/webScript/extract_log.sh', ['/home/back_api/dns-log'])
        process.stdout.on('end', (data) => {
            res.json("log sudah diambil")
        })
    })

    // app.get('/stream-log', (req,res) => {
    //     const child = spawn('cat',['/home/go_malvin/dns_log'])

    //     let output = '';
    //     child.stdout.on('data', (data) => {
    //         output += data.toString();
    //     });

    //     child.stdout.on('end', () => {
    //         res.json(output);
    //     });
    // })

    // app.get('/execute', async (req,res) => {
    //     // contoh curl : localhost:3000/execute?command=ls%20-l (%20 adalah spasi)
    //     // url untuk request log : localhost:3000/execute?command=./script/extract_log.sh%20/var/log/bind/query.log
    //     try {
    //         const command = req.query.command

    //         if (command.trim().length == 0){
    //             res.status(401).send('Command Cant be Empty')
    //         }
    //         else{

    //             const result = await runcommand(command);

    //             res.json(result)

    //         }
    //     }
    //     catch(err) {
    //         res.status(500).send('Error While Executing Command')
    //     }
    // })
}
