#!/bin/bash

ip=$1

if sed -n '/acl "allowed" {/,/}/p' /etc/bind/named.conf.options | grep -q "$ip"; then
    sed -i "\|acl \"allowed\" {|,\|}| {\|$ip|d;}" /etc/bind/named.conf.options
    if [ $? -eq 0 ]; then
        echo "Ip successfully deleted."
    else
        echo "Something Wrong while doing delete."
    fi
else 
    echo "IP doesnt exist."
fi

rndc reload