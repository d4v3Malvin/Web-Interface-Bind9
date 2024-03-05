#!/bin/bash

record=$3
domain=$2
filename=$1

function add_domain()
{
    domain=$2

    if sed -n "/$domain\\tIN\\t$record\\t0.0.0.0/p" $1 | grep -q .; then
        echo "failed"
    else
        sh -c "echo '$domain\tIN\t$record\t0.0.0.0' >> $1"
        echo "success"
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

rndc reload > /dev/null