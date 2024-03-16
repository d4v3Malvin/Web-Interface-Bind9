async function getAllLog(client,query){
    const db = client.db("web-interface-bind9")
    const log = db.collection("dns-log")
    let cursor = null
    if (query == ""){
        cursor = await log.find({})
    }
    else {
        cursor = await log.find({ type: query })
    }
    return cursor.toArray()
}

async function getCountAll(client) {
    const db = client.db("web-interface-bind9")
    const log = db.collection("dns-log")

    if ((await log.countDocuments(query)) > 0){
        return true
    }
    
    return false
}

// async function getTopDomain(client,type,time){
    
// }

module.exports = {
    getAllLog: getAllLog,
    getCountAll: getCountAll
}