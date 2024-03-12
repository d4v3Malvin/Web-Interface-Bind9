#!/bin/bash

record=$3
domain=$2
filename=$1

function add_domain()
{
    domain=$2

    address="0.0.0.0"

    if [[ $record == "AAAA" ]]; then
        address="::"
    fi

    if sed -n "/$domain\\tIN\\t$record\\t$address/p" $1 | grep -q .; then
        echo "failed"
    else
        sh -c "echo '$domain\tIN\t$record\t$address' >> $1"
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