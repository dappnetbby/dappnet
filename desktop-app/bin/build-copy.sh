set -ex

BINDIR=$(realpath ./bin)

echo Building local-gateway
cd ../local-gateway/gwgo/
/usr/local/go/bin/go build
cp local-gateway $BINDIR/

echo Building socks5 proxy
cd socks5/
/usr/local/go/bin/go build
cp socks5-proxy $BINDIR/