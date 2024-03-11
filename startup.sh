#!/bin/bash

web_path="/home/back_api"
script_path="/home/webScript"
repo_path=$(pwd)
local_ip=$(ip a | grep inet | grep -v inet6 | grep -v 127.0.0.1 | head -n 1 | awk -F" " '{print $2}' | awk -F/ '{print $1}')
app=""

if ! which named > /dev/null; then
    app+="bind9 "
fi
if ! which nginx > /dev/null; then
    app+="nginx "
fi
if ! which dnscrypt-proxy > /dev/null; then
    app+="dnscrypt-proxy "
fi
if [[ $app != "" ]]; then 
    echo "Dependency installation is on progress ..."
    echo "Update and Upgrade APT Repo ..."
    apt-get update -y > /dev/null && apt-get upgrade -y > /dev/null
    echo "Update and Upgrade APT Repo Done"
    if ! which nodejs >/dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - &&\
        apt-get --fix-broken install -y nodejs > /dev/null
    fi
    apt-get update -y > /dev/null | apt-get --fix-broken install $app -y > /dev/null
    echo "Installation done"
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
systemctl enable named > /dev/null 2>&1
cp Backend/bind-conf/named.conf.options /etc/bind/
sed -i '/\/var\/cache\/bind\/ rw,/a \ \ \/var/log/bind/** rw,' "/etc/apparmor.d/usr.sbin.named"
sed -i '/\/var\/cache\/bind\/ rw,/a \ \ \/var/log/bind/ rw,' "/etc/apparmor.d/usr.sbin.named"
cp /etc/bind/db.empty /etc/bind/db.ads.rpz 
cp /etc/bind/db.empty /etc/bind/db.blocked.rpz
systemctl restart apparmor
systemctl restart named
echo "Creating DNS log directory ..."
if [ ! -d "/var/log/bind" ]; then 
    mkdir -p "/var/log/bind"
fi
if [ -d "/var/log/bind" ]; then
    if [ "$(stat -c '%U' "/var/log/bind")" != "bind" ]; then
        chown -R bind:bind /var/log/bind
    fi
fi
echo "Finished DNS log directory"
# Setup dnscrypt-proxy
echo "Setting up dnscrypt-proxy"
sed -i -e "s/listen_addresses = .*/listen_addresses = \['127.0.0.1:5353'\]/" "/etc/dnscrypt-proxy/dnscrypt-proxy.toml"
sed -i -e "s/server_names = .*/server_names = \['cloudflare'\]/" "/etc/dnscrypt-proxy/dnscrypt-proxy.toml"
systemctl restart dnscrypt-proxy
echo "Dnscrypt-proxy setup finished"
# Setup Node_API
echo "Setting up API Server ..."
cp -r Backend/node-api/* $web_path
cp -r Backend/script/* $script_path
cp $web_path/example.env $web_path/.env
cp Backend/config/node_api.service /lib/systemd/system/
sed -i -e "s|LOG_PATH='.*'|LOG_PATH='$web_path/dns-log'|" "$web_path/.env"
chmod +x $script_path/*
cp $repo_path/Backend/config/extrac_dns_log /etc/cron.d/extract_dns_log
cd $web_path
echo "Installing NPM Package ..."
npm install -q > /dev/null 2>&1
echo "NPM Installation done"
systemctl daemon-reload
systemctl start node_api
systemctl enable node_api
echo "API Server setup finished"
# Creating username and password for website.
echo "Setting up Login Credential"
echo WVdSdGFXNEsK > $web_path/login_cred
echo Ym1sdFpHRUsK >> $web_path/login_cred
echo "Finish Setting up Login Credential"
$script_path/Blocked_Domain_add.sh db.ads.rpz doubleclick.net A
$script_path/Blocked_Domain_add.sh db.ads.rpz doubleclick.net AAAA
## Setup Frontend
echo "Setting up Frontend Application ..."
cd $repo_path/Frontend
npm install -q > /dev/null 2>&1
cp dotenv .env
sed -i -e "s/VUE_APP_HOST_API=.*/VUE_APP_HOST_API='$local_ip'/" "$repo_path/Frontend/.env"
echo "Building Vue Application ..."
npm run build > /dev/null 2>&1
echo "Vue Application built"
mkdir /var/www/web_interface
cp -r $repo_path/Frontend/dist/* /var/www/web_interface
cp $repo_path/nginx_conf/web-bind9 /etc/nginx/sites-available
rm -rf /etc/nginx/sites-available/default
rm -rf /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/web-bind9 /etc/nginx/sites-enabled/
systemctl restart nginx
echo "Finished Setting up Frontend Application ..."

# ip a | grep inet | grep -v inet6 | grep -v 127.0.0.1 | head -n 1 | awk -F" " '{print $2}' | awk -F/ '{print $1}'