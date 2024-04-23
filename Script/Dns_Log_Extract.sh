#!/bin/bash

api="localhost:3000/extract-log"
output=$(curl -X GET -s "$api")

code=$(echo "$output" | jq -r ".code")

while [[ $code != 200 && $code != 201 ]]; do
    output=$(curl -X GET -s "$api")
    code=$(echo "$output" | jq -r ".code")
    sleep 2
done

message=$(echo $output | jq -r ".message")

echo $message

if [[ $code == 200 ]]; then
    rm -rf /var/log/bind/temp_query.log
fi