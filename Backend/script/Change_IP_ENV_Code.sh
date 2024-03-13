#!/bin/bash

repo_path=$1

ip_local=$(hostname -I | awk '{print $1}')

sed -i -e "s/VUE_APP_HOST_API=.*/VUE_APP_HOST_API='$ip_local'/" "$repo_path/Frontend/.env"