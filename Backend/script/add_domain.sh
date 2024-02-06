#!/bin/bash

domain=$2
filename=$1

function add_domain()
{
    file_contents=$(cat $1)
    domain=$2

    if [[ ! $file_contents =~ "$domain	IN	CNAME	0.0.0.0"   ]]; then
        sh -c "echo '$domain	IN	CNAME	0.0.0.0' >> $1"
        echo "success"
    else
        echo "failed"
    fi
}

domain_status=$(add_domain /etc/bind/$filename $domain)

if [ "$domain_status" == "success" ]; then
    add_domain /etc/bind/$filename *.$domain > /dev/null
    rndc reload > /dev/null
    echo "Domain Successfully Added"
elif [ "$domain_status" == "failed" ]; then 
    echo "Domain Already Registered."
else
    echo "$domain_status"
fi