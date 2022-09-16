set -ex
export PRODUCT=dappnet

cd dist/

# Chrome.
zip $PRODUCT-chrome.zip chrome/

# Firefox.
cd firefox/
npx web-ext sign --api-key=$FIREFOX_API_KEY --api-secret=$FIREFOX_API_SECRET
XPI=$(find . -name '*.xpi')
cp $XPI ../$PRODUCT-firefox.xpi

