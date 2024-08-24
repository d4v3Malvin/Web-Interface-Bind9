db = connect('mongodb://localhost:27017/web-interface-bind9')

let pass = btoa(btoa("nimda"))

db.user.updateOne({ username: "admin" }, { $set: { password : pass } })