#!/bin/bash

web_path="/home/back_api"
script_path="/home/webScript"
app=""

if ! which node >/dev/null; then
    app+="nodejs "
fi
if ! which npm >/dev/null; then
    app+="npm "
fi
if ! which named > /dev/null; then
    app+="bind9 "
fi
if ! which dnscrypt-proxy > /dev/null; then
    app+="dnscrypt-proxy "
fi
if [[ $app != "" ]]; then 
    apt-get update -y && apt-get install $app -y 
fi
if [ ! -d $web_path ]; then 
    mkdir -p $web_path
else
    rm -rf $web_path/*
fi
if [ ! -d $script_path ]; then 
    mkdir -p $script_path
else
    rm -rf $script_path/*
fi
if [ ! -f "$script_path/dns-log" ]; then
    touch $script_path/dns-log
fi
# Setup BIND
systemctl enable named
cp bind-conf/named.conf.options /etc/bind/
sed -i '/\/var\/cache\/bind\/ rw,/a \ \ \/var/log/bind/** rw,' "/etc/apparmor.d/usr.sbin.named"
sed -i '/\/var\/cache\/bind\/ rw,/a \ \ \/var/log/bind/ rw,' "/etc/apparmor.d/usr.sbin.named"
cp /etc/bind/db.empty /etc/bind/db.ads.rpz 
cp /etc/bind/db.empty /etc/bind/db.blocked.rpz
systemctl restart apparmor
systemctl restart named
if [ ! -d "/var/log/bind" ]; then 
    mkdir -p "/var/log/bind"
fi
if [ -d "/var/log/bind" ]; then
    if [ "$(stat -c '%U' "$directory")" != "bind" ]; then
        chown -R bind:bind /var/log/bind
    fi
fi
# $script_path/complete_add_domain.sh db.ads.rpz doubleclick.net 
# Setup dnscrypt-proxy
sed -i -e "s/listen_addresses = .*/listen_addresses = \['127.0.0.1:5353'\]/" "/etc/dnscrypt-proxy/dnscrypt-proxy.toml"
sed -i -e "s/server_names = .*/server_names = \['cloudflare'\]/" "/etc/dnscrypt-proxy/dnscrypt-proxy.toml"
systemctl restart dnscrypt-proxy
# Setup Node_API
cp -r node-api/* $web_path
cp -r script/* $script_path
cp $web_path/example.env $web_path/.env
cp config/node_api.service /lib/systemd/system/
sed -i -e "s|LOG_PATH='.*'|LOG_PATH='/root/dns-log'|" "$web_path/.env"
chmod +x $script_path/*
cd $web_path
npm install
systemctl daemon-reload
systemctl start node_api
systemctl enable node_api