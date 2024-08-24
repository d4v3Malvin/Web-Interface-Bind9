#!/bin/bash

web_path="/home/back_api"

mongosh --file $web_path/js/reset-pass.js

if [ $? -eq 0 ]; then
        echo "Password have been resetted"
else
        echo "Something Wrong while resetting password."
fi