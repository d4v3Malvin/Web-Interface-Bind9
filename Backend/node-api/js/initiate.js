db = connect('mongodb://localhost:27017/web-interface-bind9')

db.createCollection('dns-log')