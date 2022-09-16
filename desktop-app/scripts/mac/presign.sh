BASE=$(pwd)

cd dist/mac-arm64/Dappnet.app/Contents/Resources/

mkdir -p app.asar.unpacked/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/
cd ./app.asar.unpacked/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/

cp $BASE/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs .

