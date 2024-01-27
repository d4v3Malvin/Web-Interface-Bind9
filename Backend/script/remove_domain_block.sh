#!/bin/bash

path=$1

pattern=$2

sh -c "sed -i '/$pattern/d' $1"

file_contents=$(cat $path)

if [[ ! $file_contents =~ "$2"   ]]; then
	echo "domain $2 have been deleted"
fi
