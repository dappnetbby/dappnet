#!/usr/bin/env bash

# Generates your own Certificate Authority for development.
# This script should be executed just once.

set -ex

# Check if ca.key exists, if so, confirm delete
if [ -f "ca.crt" ] || [ -f "ca.key" ]; then
    echo -e "\e[41mCertificate Authority files already exist!\e[49m"
    
    # confirm delete
    read -p "Do you want to delete them? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm ca.key ca.pubkey ca.crt
    else
        echo "Aborting..."
        exit 1
    fi
fi

# Generate private key
openssl genrsa -out ca.key 2048

# Generate root certificate
openssl req -x509 -new -nodes -subj "/C=US/O=Dappnet CA/CN=Dappnet certificates" -key ca.key -sha256 -days 3650 -out ca.crt

# Generate public key
openssl rsa -in ca.key -pubout > ca.pubkey

# Convert key to a format that can be used by the gateway.
openssl rsa -in ca.key -out ca.2.key

# Convert certificate to a format usable by Firefox.
openssl pkcs12 -export -in server.crt -inkey server.key -out server.p12

# Dump cert/keys to a .json, for import by the gateway.
python dump_cert.py > dappnet-ca.json