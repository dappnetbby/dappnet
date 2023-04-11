
# Log the signing, notarization steps.
export DEBUG="electron-osx-sign*,electron-notarize:notarytool,*"
export NODE_ENV=production 

# Get the latest version from the package.json.
VERSION=$(cat ./package.json | jq -r .version)

# Build.
npm run build-ui
npm run build

# Build, package and publish.
npx electron-builder --publish always

# Manually do notarization for .pkg and reupload.
PKG_ARTIFACT=Dappnet-$VERSION.pkg

# Check artifact exists
if [ ! -f dist/$PKG_ARTIFACT ]; then
  echo "Artifact $PKG_ARTIFACT not found"
  exit 1
fi

xcrun notarytool submit dist/$PKG_ARTIFACT --apple-id $APPLEID --password $APPLEIDPASS --team-id $APPLETEAMID --wait
xcrun stapler staple dist/$PKG_ARTIFACT

# Now upload to release.
GH_RELEASE_TAG=v$VERSION
echo "Uploading notarized $PKG_ARTIFACT to release $GH_RELEASE_TAG"
gh release upload -R liamzebedee/test1717 --clobber $GH_RELEASE_TAG dist/$PKG_ARTIFACT