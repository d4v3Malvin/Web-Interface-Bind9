#!/bin/bash

log_path=$1
outputsfile="/tmp/temp_top2"
time=$2

if [[ $time == "all" ]]; then
    awk -F, '{print $4}' "$log_path" \
    | sort > $outputsfile
else
    time_string=''
    if [[ $time == "60m" ]]; then
        time_string='-60 minutes'
    elif [[ $time == "1d" ]]; then
        time_string='-1 days'
    elif [[ $time == '1m' ]]; then
        time_string='-30 days'
    elif [[ $time == '1y' ]]; then
        time_string='-365 days'
    fi
    awk -F, -v time_in_second=$(date -d "$time_string" +'%s') \
    '{
        split($2, dates, "-")
        split($3, times, ":")
        query_time = mktime(dates[3] " " dates[2] " " dates[1] " " times[1] " " times[2] " " times[3])
        if (time_in_second - query_time <= 0) {
            print $4
        }
    }' "$log_path" \
    | sort > $outputsfile 
fi


cat $outputsfile | uniq -c > /tmp/tmpfiles2

cat /tmp/tmpfiles2

rm /tmp/tmpfiles2

rm $outputsfile