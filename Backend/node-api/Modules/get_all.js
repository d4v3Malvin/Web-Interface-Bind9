async function getAllLog(client){
    const db = client.db("web-interface-bind9")
    const log = db.collection("dns-log")
    const cursor = await log.find({})
    return cursor.toArray()
}

module.exports = {
    getAllLog: getAllLog
}