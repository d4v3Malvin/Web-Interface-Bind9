#!/bin/bash

setting= sed -n '/rate-limit {/,/}/p' /etc/bind/named.conf.options | sed '1d;$d'