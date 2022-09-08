CERT=./node_modules/@dappnet/local-gateway/dev-certificates/ca.crt

sudo security verify-cert -c $CERT

sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $CERT