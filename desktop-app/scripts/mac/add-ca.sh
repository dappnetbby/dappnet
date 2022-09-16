set -ex
# Add the Dappnet root CA to the system Keychain for macOS.
# This CA signs all *.eth domains.
export CERT=./node_modules/@dappnet/local-gateway/dev-certificates/ca.crt

# This is verified to work on macOS 12.5.1 (21G83).
sudo security verify-cert -c $CERT
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $CERT