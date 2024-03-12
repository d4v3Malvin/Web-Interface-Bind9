#!/bin/bash
path=$1
pattern=$2
record=$3
address="0.0.0.0"

sh -c "sed -i '/^\b$pattern\b.*\b$record\b/d' $path"
sh -c "sed -i '/^*.\b$pattern\b.*\b$record\b/d' $path"

file_contents=$(cat $path)

if [[ $record == "AAAA" ]]; then
	address="::"
fi

if [[ ! $file_contents =~ "$pattern\tIN\t$record\t$address" ]]; then
	echo "domain $2 have been deleted"
fi

rndc reload > /dev/null