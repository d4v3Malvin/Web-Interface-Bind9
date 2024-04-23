#!/bin/bash

old_pass=$1
new_pass=$2

enc_old=$(echo "$old_pass" | base64 | base64)
enc_new=$(echo "$new_pass" | base64 | base64)

sed -i "s/$enc_old/$enc_new/g" /home/back_api/login_cred

if [ $? -eq 0 ]; then
        echo "Password have been changed"
else
        echo "Something Wrong while changing password."
fi