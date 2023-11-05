#!/bin/bash

file_contents=$(cat $1)
domain=$2

if [[ ! $file_contents =~ "$domain	IN	CNAME	."   ]]; then
	sh -c "echo '$domain	IN	CNAME	0.0.0.0' >> $1"
else
	"Domain Already Registered."
fi
