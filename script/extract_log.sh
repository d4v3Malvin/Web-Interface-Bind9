#!/bin/bash

outputsfile=$1

extract () {
	file='/var/log/bind/temp_query.log'
	while read line; do
		date=$( echo $line | cut -d " " -f 1 )
		type_log=$( echo $line | cut -d " " -f 3 | cut -d ":" -f 1)
		client=$( echo $line | cut -d " " -f 7 | cut -d "#" -f 1 )
		times=$( echo $line | cut -d " " -f 2 | cut -d "." -f 1 )
		if [[ $line =~ "queries"  ]]; then
					query=$( echo $line | cut -d " " -f 10 )
					type=$( echo $line | cut -d " " -f 12 )
					echo $type_log,$date,$times,$client,$query,$type'|' >> $outputsfile
		elif [[ $line =~ "query-error"  ]]; then
			echo $type_log,$date,$times,$client,"Blocked By Client Filtering"'|' >> $outputsfile
		elif [[ $line =~ "rpz" ]]; then
			querys=$( echo $line | cut -d " " -f 8 | cut -d " " -f 1 | cut -d "(" -f 2)
			echo $type_log,$date,$times,$client,$query'|' >> $outputsfile
		fi
	done < $file
}

if [ ! -e "$outputsfile" ]; then 
	touch "$outputsfile"
fi

cp /var/log/bind/query.log /var/log/bind/temp_query.log

extract

rm /var/log/bind/temp_query.log

truncate -s 0 /var/log/bind/query.log