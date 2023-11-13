#!/bin/bash

outputfile="/home/back_api/block-list"
tempfile="/home/back_api/temp-blocklist"

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

cat /etc/bind/db.blocked.rpz | awk '$4=="0.0.0.0" {print}' > $outputfile
cat /etc/bind/db.ads.rpz | awk '$4=="0.0.0.0" {print}' >> $outputfile

while read line; do
		domains=$(echo $line | cut -d " " -f 1 )
		types=$(echo $line | cut -d " " -f 3 )
		echo "$domains,$types" >> $tempfile
done < $outputfile

cat $tempfile

rm $tempfile
rm $outputfile