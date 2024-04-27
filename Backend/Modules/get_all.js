const moment = require('moment')

function initiatedb(client){
    const db = client.db("web-interface-bind9")
    const log = db.collection("dns-log")
    return log
}

async function getAllLog(client,query){
    const log = initiatedb(client)
    let cursor = null
    if (query == "all"){
        cursor = await log.find()
    }
    else {
        cursor = await log.find({ type: query })
    }
    return cursor.toArray()
}

async function getallpage(client,page,query,search,datestart,dateend) {
    const log = initiatedb(client)

    let limit = 10
    let sort = {
        'date': -1
    }
    let skip = (page-1) * 10
    let querys = {}

    if (String(search).length > 0){
        querys["domain"] = new RegExp(search, 'i')
    }

    if (query != "all"){
        querys["type"] = query
    }

    let datequery = {
        '$gte': moment(datestart).utcOffset(7).startOf('day').toDate(),
        '$lte': moment(dateend).utcOffset(7).endOf('day').toDate()
    }

    if (String(datestart).length > 0 && String(dateend).length > 0){
        querys["date"] = datequery
    }

    console.log(querys)

    const cursor = await log.find(querys,{sort,skip,limit})

    return cursor.toArray()
}

async function getCountAll(client,query,search,start,end) {
    const log = initiatedb(client)

    let querylist = {
        type: query
    }

    if (String(search).length > 0){
        querylist["domain"] = new RegExp(search, 'i')
    }

    let datequery = {
        '$gte': moment(start).utcOffset(7).startOf('day').toDate(),
        '$lte': moment(end).utcOffset(7).endOf('day').toDate()
    }

    if (String(start).length > 0 && String(end).length > 0){
        querylist["date"] = datequery
    }

    const count = await log.countDocuments(querylist)
    
    return count
}

async function gettendomain(client,type,start = undefined,end = undefined){
    const log = initiatedb(client)

    const arg = [
        {
            '$match': {},
        },
        {
            '$group': {
                '_id': {
                    'domain': '$domain'
                }, 
                'count': {
                    '$count': {}
                }
            }
        },
        {
            '$sort': {
                'count': -1
            }
        }, 
        {
            '$limit': 10
        }
    ]

    if (type != "all"){
        arg[0]['$match']['type'] = type
    }

    if (start && end){
        arg[0]['$match']['date'] = {
            '$gte': moment(start).utcOffset(7).toDate(), 
            '$lte': moment(end).utcOffset(7).toDate()
        }
    }
    
    const cursor = log.aggregate(arg)

    return cursor.toArray()
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
    gettendomain: gettendomain,
    getEpochLog: getEpochLog
}