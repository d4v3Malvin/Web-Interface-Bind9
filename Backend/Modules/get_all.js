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

async function gettenclient(client,start = undefined,end = undefined){
    const log = initiatedb(client)

    const arg = [
        {
            '$match': {},
        },
        {
            '$group': {
                '_id': {
                    'ip_client': '$ip_source'
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

    if (start && end){
        arg[0]['$match']['date'] = {
            '$gte': moment(start).utcOffset(7).toDate(), 
            '$lte': moment(end).utcOffset(7).toDate()
        }
    }
    
    const cursor = log.aggregate(arg)

    return cursor.toArray()
}

module.exports = {
    getAllLog: getAllLog,
    getallpage: getallpage,
    getCountAll: getCountAll,
    gettendomain: gettendomain,
    gettenclient: gettenclient
}