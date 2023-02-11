set -ex
export IPFS_PATH=$(pwd)/.ipfs/

if [ ! -e $IPFS_PATH ] 
then
    ipfs init
fi

cp ./scripts/config.json ./.ipfs/config

# cd ./vendor/ipfs/kubo/
cd ./vendor/ipfs/go-ipfs_v0.13.0_darwin-arm64/
./ipfs daemon --stream-channels --enable-namesys-pubsub --enable-gc --manage-fdlimit
