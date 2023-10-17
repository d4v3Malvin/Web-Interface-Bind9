#!/bin/bash

filename=$1

awk -F, '{ domain[$5]++ } END { for ( d in domain ) { print d, domain[d] } }' $filename  | sort -nr | head -n 5
