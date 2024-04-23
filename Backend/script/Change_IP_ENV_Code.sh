#!/bin/bash

repo_path=$1
status=$2

if [[ $status == "public" ]]; then
    ip_local=$3
else
    ip_local=$(hostname -I | awk '{print $1}')
fi


sed -i -e "s/VUE_APP_HOST_API=.*/VUE_APP_HOST_API='$ip_local'/" "$repo_path/Frontend/.env"