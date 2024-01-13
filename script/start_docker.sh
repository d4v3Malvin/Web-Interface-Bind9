#!/bin/bash

cd /home/back_api

cp /home/back_api/example.env /home/back_api/.env

sed -i -e "s|LOG_PATH='.*'|LOG_PATH='/home/back_api/dns-log'|" ".env"

node server.js &

touch dns-log

cp /etc/bind/db.empty /etc/bind/db.ads.rpz 

cp /etc/bind/db.empty /etc/bind/db.blocked.rpz

cd /home/webScript

./complete_add_domain.sh db.ads.rpz doubleclick.net 

/usr/sbin/named -c /etc/bind/named.conf -u bind -f

sed -i -e "s/listen_addresses = .*/listen_addresses = \['127.0.0.1:5353'\]/" /etc/dnscrypt-proxy/dnscrypt-proxy.toml
sed -i -e "s/server_names = .*/server_names = \['cloudflare'\]/" /etc/dnscrypt-proxy/dnscrypt-proxy.toml

/sbin/dnscrypt-proxy -config /etc/dnscrypt-proxy/dnscrypt-proxy.toml