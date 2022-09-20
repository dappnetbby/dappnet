#!/bin/sh
# Build Firefox extension package.
set -ex

PRODUCT=dappnet-extension
BASE=$(pwd)

# Increment the version in src/firefox/manifest.json.
# Firefox will not compile a signed .xpi for a version already published.
cd $BASE/src/firefox
MANIFEST_VERSION=$(cat manifest.json | jq -r .version)
MANIFEST_VERSION_BUMP=$(node -e "let v = process.argv[1].split('.'); console.log(v[0] + '.' + v[1] + '.' + (parseInt(v[2]) + 1))" $MANIFEST_VERSION)
NEW_MANIFEST=$(jq --arg newVersion "$MANIFEST_VERSION_BUMP" '.version = $newVersion' manifest.json)
echo "$NEW_MANIFEST" > manifest.json

# Rebuild.
cd $BASE
npm run build:firefox

# Now sign.
cd $BASE/build/firefox
npx web-ext sign --api-key=$FIREFOX_API_KEY --api-secret=$FIREFOX_API_SECRET

# Copy .xpi to dist/
VERSION=$(cat $BASE/src/firefox/manifest.json | jq -r .version)
BROWSER=firefox
RELEASE=$PRODUCT\_$BROWSER\_$VERSION
XPI=$(find . -name '*.xpi')
cp "$XPI" "$BASE/dist/$RELEASE.xpi"