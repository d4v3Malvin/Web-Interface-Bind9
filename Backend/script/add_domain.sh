#!/bin/bash

domain=$2
filename=$1

function add_domain()
{
    file_contents=$(cat $1)
    domain=$2

    if [[ ! $file_contents =~ "$domain	IN	CNAME	."   ]]; then
        sh -c "echo '$domain	IN	CNAME	0.0.0.0' >> $1"
        echo "success"
    else
        echo "failed"
    fi
}

add_domain=$(add_domain /etc/bind/$filename $domain)

if [ "$add_domain" == "success" ]; then
    add_domain /etc/bind/$filename *.$domain
    rndc reload
    echo "Domain Successfully Added"
elif [ "$add_domain" == "failed" ]; then 
    echo "Domain Already Registered."
else
    echo "$add_domain"
fi