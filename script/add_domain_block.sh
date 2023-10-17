#!/bin/bash

file_contents=$(cat $1)
domain=$2

if [[ ! $file_contents =~ "$domain	IN	CNAME	."   ]]; then
	sudo sh -c "echo '$domain	IN	CNAME	.' >> $1"
	sudo systemctl restart bind9.service
else
	echo "Domain Already Registered."
fi
