source .env

rm -rf dist/firefox
npm run build:firefox

# npx web-ext sign --api-key=$FIREFOX_API_KEY --api-secret=$FIREFOX_API_SECRET

cd dist/firefox

npx shipit firefox .

cp web-ext-artifacts/* ../firefox.xpi
