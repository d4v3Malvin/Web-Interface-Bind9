#!/bin/bash

old_pass=$(tail -n 1 /home/back_api/login_cred)

default_pass=$(echo "nimda" | base64 | base64)


sed -i "s/$old_pass/$default_pass/g" /home/back_api/login_cred

if [ $? -eq 0 ]; then
        echo "Password have been reset to default"
else
        echo "Something Wrong while resetting password."
fi