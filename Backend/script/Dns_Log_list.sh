#!/bin/bash

outputsfile=$1

extract () {
	file='/var/log/bind/temp_query.log'
	while read line; do
		sh -c "sed -i \"/$line/d\" /var/log/bind/query.log"
		date=$( echo $line | cut -d " " -f 1 )
		day=$( echo $date | cut -d "-" -f 1 )
		month=$( echo $date | cut -d "-" -f 2 )
		year=$( echo $date | cut -d "-" -f 3 )
		case $month in
			"Jan")
				number_month=1
			;;
			"Feb")
				number_month=2
			;;
			"Mar")
				number_month=3
			;;
			"Apr")
				number_month=4
			;;
			"May")
				number_month=5
			;;
			"Jun")
				number_month=6
			;;
			"Jul")
				number_month=7
			;;
			"Aug")
				number_month=8
			;;
			"Sep")
				number_month=9
			;;
			"Oct")
				number_month=10
			;;
			"Nov")
				number_month=11
			;;
			"Dec")
				number_month=12
			;;
		esac
		date=$day-$number_month-$year
		type_log=$( echo $line | cut -d " " -f 3 | cut -d ":" -f 1)
		client=$( echo $line | cut -d " " -f 7 | cut -d "#" -f 1 )
		times=$( echo $line | cut -d " " -f 2 | cut -d "." -f 1 )
		if [[ $line =~ "queries"  ]]; then
					query=$( echo $line | cut -d " " -f 10 )
					type=$( echo $line | cut -d " " -f 12 )
					status="ok"
					while read lines; do
						if [[ $query == $lines ]]; then
							status="no"
							break
						fi
					done < /tmp/tmp_block_123

					if [[ $status == "ok" ]]; then 
						echo $type_log,$date,$times,$client,$query,$type'|' >> $outputsfile
					fi
		elif [[ $line =~ "query-errors"  ]]; then
			query=$( echo $line | cut -d " " -f 8 )
			error_message=$(echo $line | cut -d ":" -f 6 | grep -oP '\((.*?)\)')
			echo $type_log,$date,$times,$client,$query,"error","query failed"$error_message'|' >> $outputsfile
		elif [[ $line =~ "rpz" ]]; then
			querys=$( echo $line | cut -d " " -f 8 | cut -d " " -f 1 | cut -d "(" -f 2)
			zone=$(echo $line | cut -d " " -f 15)
			echo $type_log,$date,$times,$client,$query,"RPZ","Rewrite via "$zone'|' >> $outputsfile
		fi
	done < $file
}

/home/webScript/Blocked_Domain_list.sh | cut -d ',' -f 1 > /tmp/tmp_block_123

if [ ! -e "$outputsfile" ]; then 
	touch "$outputsfile"
fi

cp /var/log/bind/query.log /var/log/bind/temp_query.log

# clear the query.log so log not overlapping
cat /dev/null > /var/log/bind/query.log

extract

rm /var/log/bind/temp_query.log
rm /tmp/tmp_block_123

rndc reload