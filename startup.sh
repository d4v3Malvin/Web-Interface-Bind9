#!/bin/bash

web_path="/home/back_api"
script_path="/home/webScript"
repo_path=$(pwd)
app=""

chmod +x Script/*
if ! which named > /dev/null; then
    add-apt-repository -y ppa:isc/bind-dev > /dev/null
    app+="bind9 "
fi
if ! which gnupg > /dev/null; then
    app+="gnupg "
fi
if ! which curl > /dev/null; then
    app+="curl "
fi
if ! which jq > /dev/null; then
    app+="jq "
fi
if ! which nginx > /dev/null; then
    app+="nginx "
fi
if ! which dnscrypt-proxy > /dev/null; then
    app+="dnscrypt-proxy "
fi
if ! which mongod > /dev/null; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    gpg --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg \
    --dearmor > /dev/null
    echo -n "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
    app+="mongodb-org "
fi
if ! which nodejs > /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - > /dev/null
    app+="nodejs "
fi
if [[ $app != "" ]]; then 
    echo "Dependency installation is on progress ..."
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
echo "Setting up BIND9 ..."
Script/Generate_DOH_SSL.sh > /dev/null
systemctl start named > /dev/null 2>&1
systemctl enable named > /dev/null 2>&1
cp Config/Bind/named.conf.options /etc/bind/
sed -i '/\/var\/cache\/bind\/ rw,/a \ \ \/var/log/bind/** rw,' "/etc/apparmor.d/usr.sbin.named"
sed -i '/\/var\/cache\/bind\/ rw,/a \ \ \/var/log/bind/ rw,' "/etc/apparmor.d/usr.sbin.named"
cp /etc/bind/db.empty /etc/bind/db.ads.rpz 
cp /etc/bind/db.empty /etc/bind/db.blocked.rpz
systemctl restart apparmor > /dev/null 2>&1
echo "Creating DNS log directory ..."
if [ ! -d "/var/log/bind" ]; then 
    mkdir -p "/var/log/bind"
fi
rndc reload
rndc stats
if [ -d "/var/log/bind" ]; then
    if [ "$(stat -c '%U' "/var/log/bind")" != "bind" ]; then
        chown -R bind:bind /var/log/bind
    fi
fi
systemctl restart named > /dev/null 2>&1
echo "Finished DNS log directory"
echo "Bind9 Setup Finished"
# Setup dnscrypt-proxy
echo "Setting up dnscrypt-proxy"
sed -i -e "s/listen_addresses = .*/listen_addresses = \['127.0.0.1:5353'\]/" "/etc/dnscrypt-proxy/dnscrypt-proxy.toml"
sed -i -e "s/server_names = .*/server_names = \['cloudflare'\]/" "/etc/dnscrypt-proxy/dnscrypt-proxy.toml"
systemctl restart dnscrypt-proxy
echo "Dnscrypt-proxy setup finished"
# Setup Node_API
echo "Setting up API Server ..."
cp -r Backend/* $web_path
cp -r Script/* $script_path
cp $web_path/example.env $web_path/.env
cp Config/Systemd/node_api.service /lib/systemd/system/
sed -i -e "s|LOG_PATH='.*'|LOG_PATH='$web_path/dns-log'|" "$web_path/.env"
chmod +x $script_path/*
cp $repo_path/Config/Cron/extract_dns_log /etc/cron.d/extract_dns_log
cd $web_path
echo "Installing NPM Package ..."
npm install -q > /dev/null 2>&1
echo "NPM Installation done"
systemctl daemon-reload
systemctl start node_api
systemctl enable node_api
echo "API Server setup finished"
# Setup mongodb
echo "Setting up Mongodb ..."
systemctl start mongod
systemctl enable mongod
sleep 10
mongosh --file $web_path/js/initiate.js
echo "Mongodb Setup Done"
$script_path/Blocked_Domain_add.sh db.ads.rpz doubleclick.net A
$script_path/Blocked_Domain_add.sh db.ads.rpz doubleclick.net AAAA
## Setup Frontend
echo "Setting up Frontend Application ..."
cd $repo_path/Frontend
npm install -q > /dev/null 2>&1
cp dotenv .env
$script_path/Change_IP_ENV_Code.sh $repo_path
echo "Building Vue Application ..."
npm run build > /dev/null 2>&1
echo "Vue Application built"
mkdir /var/www/web_interface
cp -r $repo_path/Frontend/dist/* /var/www/web_interface
cp $repo_path/Config/Nginx/web-bind9 /etc/nginx/sites-available
rm -rf /etc/nginx/sites-available/default
rm -rf /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/web-bind9 /etc/nginx/sites-enabled/
systemctl restart nginx
echo "Finished Setting up Frontend Application ..."