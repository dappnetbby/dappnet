set -ex

export CERT=./node_modules/@dappnet/local-gateway/dev-certificates/ca.crt

# This is verified to work on macOS 12.5.1 (21G83).
sudo security verify-cert -c $CERT