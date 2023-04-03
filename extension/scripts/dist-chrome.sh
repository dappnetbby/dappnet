#!/bin/sh
# Build Chrome extension package.
set -ex

PRODUCT=dappnet-extension
BASE=$(pwd)

# Check if .zip already exists.
cd $BASE/dist/
VERSION=$(cat $BASE/src/chrome/manifest.json | jq -r .version)
BROWSER=chrome
RELEASE=$PRODUCT\_$BROWSER\_$VERSION
if [ -f "$RELEASE.zip" ]; then
  echo "$RELEASE.zip already exists."
  exit 1
fi

# Rebuild.
cd $BASE
npm run build:chrome

# Package.
cd $BASE/dist/
VERSION=$(cat $BASE/src/chrome/manifest.json | jq -r .version)
BROWSER=chrome
RELEASE=$PRODUCT\_$BROWSER\_$VERSION

cp -R $BASE/build/chrome $RELEASE/
zip -r $RELEASE.zip $RELEASE/