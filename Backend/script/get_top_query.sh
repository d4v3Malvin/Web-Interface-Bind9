#!/bin/bash

log_path=$1
number=$2
type=$3

awk_query=""

if [[ $type == "all" ]]; then
    awk_query+='|| $1=="query-errors" '
fi

awk -F, -v time_in_second=$(date -d '-30 minutes' +'%s') \
'$1=="queries"'"$awk_query"'{
    split($2, dates, "-")
    split($3, times, ":")
    query_time = mktime(dates[3] " " dates[2] " " dates[1] " " times[1] " " times[2] " " times[3])
    if (time_in_second - query_time <= 0) {
        print $5
    }
}' "$log_path" \
| sed 's/[()]//g; s/:$//' \
| sort \
| uniq -c \
| sort -r \
| head -n "$number"


# awk -F, -v dates=$(date -d '-5 minutes' +'%d-%b-%Y') \
# -v times=$(date -d '-5 minutes' +'%H:%M:%S') \
# '$1=="queries" && ($2 " " $3 >= dates " " times)'"$awk_query"'{print $5}' $log_path \
# | sed 's/[()]//g; s/:$//' | sort | uniq -c | sort -r | head -n $number
