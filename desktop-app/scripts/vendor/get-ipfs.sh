
set -ex

cd vendor/

VERSION="v0.18.1"
ARTIFACT="kubo_v0.18.1_darwin-amd64"

wget https://github.com/ipfs/kubo/releases/download/$VERSION/$ARTIFACT.tar.gz
tar -xvzf $ARTIFACT.tar.gz
chmod +x kubo/ipfs
mkdir -p ./ipfs/$ARTIFACT/
mv kubo/ipfs ./ipfs/$ARTIFACT/
# cleanup
rm -rf kubo $ARTIFACT.tar.gz