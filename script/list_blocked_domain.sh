#!/bin/bash

outputfile="/home/back_api/block-list"

if [ ! -e "$outputfile" ]; then 
	touch $outputfile
fi

cat /etc/bind/db.blocked.rpz | awk '$3=="CNAME" {print}' > $outputfile
cat /etc/bind/db.ads.rpz | awk '$3=="CNAME" {print}' >> $outputfile

cat $outputfile | awk '$1!="^*." {print $1}'

rm $outputfile