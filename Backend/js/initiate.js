db = connect('mongodb://localhost:27017/web-interface-bind9')

db.createCollection('dns-log')

db.createCollection('user')

let pass = btoa(btoa("nimda"))

db.user.insertOne({ username: "admin", password: pass })

db['dns-log'].createIndex({date: -1})