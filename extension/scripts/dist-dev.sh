set -ex
export PRODUCT=dappnet-extension

BASE=$(pwd)
cd dist/

# Chrome.
VERSION=$(cat $BASE/src/chrome/manifest.json | jq -r .version)
RELEASE=$PRODUCT\_$VERSION
cp -R $BASE/build/chrome $RELEASE.chrome/
zip -r $RELEASE.chrome.zip $RELEASE.chrome/
exit 0

# Firefox.
# VERSION=$(cat $BASE/src/firefox/manifest.json | jq -r .version)
# RELEASE=$PRODUCT\_$VERSION

# cd $BASE/build/firefox
# npx web-ext sign --api-key=$FIREFOX_API_KEY --api-secret=$FIREFOX_API_SECRET

# XPI=$(find . -name '*.xpi')
# cp "$XPI" "../../dist/$RELEASE.firefox.xpi"

