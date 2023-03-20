set -ex

alias ipfs=/Applications/Dappnet.app/Contents/Resources/app.asar.unpacked/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs
export IPFS_PATH=~/Library/Application\ Support/.ipfs

cd dappnet-docs
git pull
npx gitbook build
rm -rf ../personal-dappsites/anticaptive.eth/*
cp -R _book/ ../personal-dappsites/anticaptive.eth/
cd ../personal-dappsites/
ipfs add -r anticaptive.eth/
# read the CID from cli input
read -p "CID: " CID
ipfs name publish --key anticaptive $CID