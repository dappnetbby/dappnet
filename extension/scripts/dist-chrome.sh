#!/bin/sh
# Build Chrome extension package.
set -ex

PRODUCT=dappnet-extension
BASE=$(pwd)

# Bump version.
cd $BASE/src/chrome
MANIFEST_VERSION=$(cat manifest.json | jq -r .version)
MANIFEST_VERSION_BUMP=$MANIFEST_VERSION
# MANIFEST_VERSION_BUMP=$(node -e "let v = process.argv[1].split('.'); console.log(v[0] + '.' + v[1] + '.' + (parseInt(v[2]) + 1))" $MANIFEST_VERSION)
NEW_MANIFEST=$(jq --arg newVersion "$MANIFEST_VERSION_BUMP" '.version = $newVersion' manifest.json)
echo "$NEW_MANIFEST" > manifest.json

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