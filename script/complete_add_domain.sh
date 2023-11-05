#!/bin/bash

domain=$2
filename=$1

./add_domain_block.sh /etc/bind/$filename $domain
./add_domain_block.sh /etc/bind/$filename *.$domain

rndc reload