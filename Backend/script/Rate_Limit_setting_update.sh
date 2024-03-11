#!/bin/bash

rrl=$1

sed -i -e "s/responses-per-second .*;/responses-per-second $rrl;/" "/etc/bind/named.conf.options"

rndc reload > /dev/null

if [ $? -eq 0 ]; then
        echo "Rate Limit Count have been updated"
else
        echo "Something Wrong while updating rate limit."
fi