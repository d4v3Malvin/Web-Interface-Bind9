#!/bin/bash

if [ ! -d  /var/cache/bind/ssl ]; then
    mkdir -p /var/cache/bind/ssl
fi

commonname=$(hostname -I | awk '{print $1}')

cd /var/cache/bind/ssl

## Create CA

openssl req -x509 \
            -sha256 -days 356 \
            -nodes \
            -newkey rsa:2048 \
            -subj "/CN=$commonname/C=ID/L=None" \
            -keyout rootCA.key -out rootCA.crt 

## Create server private key

openssl genrsa -out bind-doh.key 2048

## Create CSR Config

cat > csr.conf <<EOF
[ req ]
default_bits = 2048
prompt = no
default_md = sha256
req_extensions = req_ext
distinguished_name = dn

[ dn ]
C = ID
ST = Jawa
L = None
O = bind9-doh
OU = bind9-doh
CN = $commonname

[ req_ext ]
subjectAltName = @alt_names

[ alt_names ]
IP.1 = $commonname

EOF

## Create CSR using server pk
openssl req -new -key bind-doh.key -out server.csr -config csr.conf

## Create Conf for ssl
cat > cert.conf <<EOF

authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
IP.1 = $commonname

EOF

## Generate SSL Certificate

openssl x509 -req \
    -in server.csr \
    -CA rootCA.crt -CAkey rootCA.key \
    -CAcreateserial -out bind-doh.crt \
    -days 365 \
    -sha256 -extfile cert.conf

chown bind:bind bind-doh.key bind-doh.crt