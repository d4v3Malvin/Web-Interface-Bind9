#!/bin/bash

log_path=$1
type=$2
outputsfile="/tmp/temp_top1"

awk_query=""

if [[ $type == "all" ]]; then
    awk_query+=''
elif [[ $type == "success" ]]; then
    awk_query+='$1=="queries"'
elif [[ $type == "blocked" ]]; then
    awk_query+='$1=="rpz"'
elif [[ $type == "failed" ]]; then
    awk_query+='$1=="query-errors"'
fi

if [ ! -e "$outputsfile" ]; then 
	touch "$outputsfile"
fi

awk -F, -v time_in_second=$(date -d '-30 minutes' +'%s') \
"$awk_query"'{
    split($2, dates, "-")
    split($3, times, ":")
    query_time = mktime(dates[3] " " dates[2] " " dates[1] " " times[1] " " times[2] " " times[3])
    if (time_in_second - query_time <= 0) {
        print $5
    }
}' "$log_path" \
| sed 's/[()]//g; s/:$//' \
| sort > $outputsfile

cat $outputsfile | uniq -c > /tmp/tmpfiles1

# Remove all tab in start of line.
sed -i 's/^[ \t]*//' /tmp/tmpfiles1 

#tail -n +1 /tmp/tmpfiles1  | head -n 10
cat /tmp/tmpfiles1

rm $outputsfile

rm /tmp/tmpfiles1