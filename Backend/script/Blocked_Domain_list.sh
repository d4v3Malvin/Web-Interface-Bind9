#!/bin/bash

outputfile="/home/back_api/block-list"
tempfile="/home/back_api/temp-blocklist"

function sort_and_insert()
{
	dns_block=$1

	while read line; do
		domains=$(echo $line | cut -d " " -f 1 )
		types=$(echo $line | cut -d " " -f 3 )
		block_type=$dns_block
		echo "$domains,$types,$block_type" >> $tempfile
	done < $outputfile

}

if [ ! -e "$outputfile" ]; then 
	touch $outputfile
else
	rm -f $outputfile
	touch $outputfile
fi

if [ ! -e "$tempfile" ]; then
	touch $tempfile
else
	rm -f $tempfile
	touch $tempfile
fi

cat /etc/bind/db.blocked.rpz | awk '$4=="0.0.0.0" || $4=="::" {print}' > $outputfile

sort_and_insert 'domain'

: > $outputfile

cat /etc/bind/db.ads.rpz | awk '$4=="0.0.0.0" || $4=="::" {print}' >> $outputfile

sort_and_insert 'ads'

cat $tempfile | grep -v '^*'

rm $tempfile
rm $outputfile