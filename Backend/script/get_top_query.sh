#!/bin/bash

log_path=$1
number=$2
type=$3

awk_query=""

if [[ $type == "all" ]]; then
    awk_query+='|| $1=="query-errors" '
fi

awk -F, '$1=="queries"'"$awk_query"'{print $5}' $log_path | sed 's/[()]//g; s/:$//' | sort | uniq -c | sort -r | head -n $number
