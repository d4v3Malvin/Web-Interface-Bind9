#!/bin/bash

ip=$1
location="/etc/bind/named.conf.options"

# start with 'acl "allowed" {'
# /a = append
# \\t = tab
sed -i '/^acl "allowed" {/a \\t'$ip';' $location && echo "Successfully add $ip" || echo "$?"

rndc reload