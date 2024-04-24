async function getAllLog(client,query){
    const db = client.db("web-interface-bind9")
    const log = db.collection("dns-log")
    let cursor = null
    if (query == "all"){
        cursor = await log.find()
    }
    else {
        cursor = await log.find({ type: query })
    }
    return cursor.toArray()
}

async function getallpage(client,page,query) {
    const db = client.db("web-interface-bind9")
    const log = db.collection("dns-log")
    let cursor = null

    skip = (page-1) * 10

    if (query == "all"){
        cursor = await log.aggregate([
            { $sort: { date: -1, time: -1 } },
            { $skip: Number(skip) },
            { $limit: 10 }
        ])
    }
    else{
        cursor = await log.aggregate([
            { $sort: { date: -1, time: -1 } },
            { $skip: Number(skip) },
            { $limit: 10 },
            { $match : { type : query } }
        ])
    }

    return cursor.toArray()
}

async function getCountAll(client) {
    const db = client.db("web-interface-bind9")
    const log = db.collection("dns-log")

    const count = await log.countDocuments({})
    
    return count
}

async function getEpochLog(client,type,time){
    let now_epoch = Date.now()

    const hour = 1000 * 360
    const day = hour * 24
    const month = day * 30
    const year = day * 365

    if (time == "60m"){
        now_epoch -= hour
    }
    else if (time == "1d"){
        now_epoch -= day
    }
    else if (time == "1m"){
        now_epoch -= month
    }
    else if (time == "1y"){
        now_epoch -= year
    }

    let data = await getAllLog(client,type)

    let filtered = data.filter((row) => {
        let date_array = row.date.split('-')
        let time_array = row.time.split(':')
        let dateEpoch = new Date(date_array[0],date_array[1]-1,date_array[2],time_array[0],time_array[1],time_array[2]).getTime()

        if (dateEpoch >= now_epoch){
            return row
        }
    })

    if (time == "all"){
        filtered = data
    }

    return filtered
}

module.exports = {
    getAllLog: getAllLog,
    getallpage: getallpage,
    getCountAll: getCountAll,
    getEpochLog: getEpochLog
}