#!/bin/bash
path=$1
pattern=$2
record=$3

sh -c "sed -i '/^\b$pattern\b.*\b$record\b/d' $path"
sh -c "sed -i '/^*.\b$pattern\b.*\b$record\b/d' $path"
file_contents=$(cat $path)
if [[ ! $file_contents =~ "$2\tIN\t$3\t0.0.0.0" ]]; then
	echo "domain $2 have been deleted"
fi

rndc reload > /dev/null