#!/bin/bash

if ! which node >/dev/null; then
    apt-get update -y && \
    apt-get install -y nodejs
fi
if ! which npm >/dev/null; then
    apt-get update -y && \
    apt-get install -y npm
fi
if [ ! -d "/root/node-app" ]; then 
    mkdir /root/node-app
else
    rm -rf /root/node-app/*
fi
cp -r node-api/* /root/node-app
cp /root/node-app/example.env /root/node-app/.env
sed -i -e "s|LOG_PATH='.*'|LOG_PATH='/root/dns-log'|" "/root/node-app/.env"
cd /root/node-app
npm install
cd -
cp config/node_api.service /lib/systemd/system/node_api.service
systemctl daemon-reload
systemctl start node_api
systemctl enable node_api

# apt-get install bind9 dnscrypt-proxy