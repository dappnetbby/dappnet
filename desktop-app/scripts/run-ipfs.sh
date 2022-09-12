set -ex
export IPFS_PATH=$(pwd)/.ipfs/

if [ ! -e $IPFS_PATH ] 
then
    ipfs init
fi

cp ./scripts/config.json ./.ipfs/config

cd ./vendor/ipfs/kubo/
./ipfs daemon --stream-channels --enable-namesys-pubsub --enable-gc --manage-fdlimit
