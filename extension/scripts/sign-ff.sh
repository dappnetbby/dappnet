source .env

rm -rf dist/firefox
npm run build:firefox

cd dist/firefox

npx web-ext sign --api-key=$FIREFOX_API_KEY --api-secret=$FIREFOX_API_SECRET

cp web-ext-artifacts/* ../firefox.xpi