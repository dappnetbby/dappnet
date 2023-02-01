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

echo -e "\e[42mSuccess!\e[49m"
echo
echo "The following files have been written:"
echo -e "  - \e[93mca.crt\e[39m is the public certificate that should be imported in your browser"
echo -e "  - \e[93mca.key\e[39m is the private key that will be used by \e[93mcreate-certificate.sh\e[39m"
echo
echo "Next steps:"
echo -e "  - Import \e[93mca.crt\e[39m in your browser"
echo -e "  - run \e[93mcreate-certificate.sh example.com\e[39m"

openssl rsa -in ca.key -pubout > ca.pubkey

openssl rsa -in ca.key -out ca.2.key

python dump_cert.py > dappnet-ca.json