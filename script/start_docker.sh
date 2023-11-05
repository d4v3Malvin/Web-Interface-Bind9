#!/bin/bash

cd /home/back_api

cp /home/back_api/example.env /home/back_api/

sed -i "s|LOG_PATH='.*'|LOG_PATH='/home/back_api/dns-log'|" ".env"

node server.js &

touch dns-log

cp /etc/bind/db.empty /etc/bind/db.ads.rpz 

cp /etc/bind/db.empty /etc/bind/db.blocked.rpz

/usr/sbin/named -c /etc/bind/named.conf -u bind -f