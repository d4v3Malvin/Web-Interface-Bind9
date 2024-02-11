#!/bin/bash

# /patern1/,/patern2/ = print line between patern 1 and 2
# p = exact line
# 1d = first line
# $d = last line
ip_list= sed -n '/acl "allowed" {/,/}/p' /etc/bind/named.conf.options | sed '1d;$d'