#!/bin/bash

filepath="/var/log/bind/bind.stats"
size=0

sudo truncate -s 0 $filepath
rndc stats
cat /var/log/bind/bind.stats | grep -hA 15 "++ Cache Statistics ++" \
| grep -E "cache tree memory in use|cache heap memory in use" > /tmp/memory_temp1

while read line; do
    temp=$( echo $line | cut -d " " -f 1)
    size=$(( $size + $temp ))
done < /tmp/memory_temp1

echo $size

rm /tmp/memory_temp1