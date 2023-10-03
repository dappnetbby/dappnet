#!/bin/bash
set -ex

NAME=$1
ICON=$2
URI=$3

rm -rf $NAME.app

cp -r Dapp.app.template $NAME.app

# rm MyIcon.icns
mkdir MyIcon.iconset/
sips -z 16 16     $ICON --out MyIcon.iconset/icon_16x16.png
sips -z 32 32     $ICON --out MyIcon.iconset/icon_16x16@2x.png
sips -z 32 32     $ICON --out MyIcon.iconset/icon_32x32.png
sips -z 64 64     $ICON --out MyIcon.iconset/icon_32x32@2x.png
sips -z 128 128   $ICON --out MyIcon.iconset/icon_128x128.png
sips -z 256 256   $ICON --out MyIcon.iconset/icon_128x128@2x.png
sips -z 256 256   $ICON --out MyIcon.iconset/icon_256x256.png
sips -z 512 512   $ICON --out MyIcon.iconset/icon_256x256@2x.png
sips -z 512 512   $ICON --out MyIcon.iconset/icon_512x512.png
iconutil -c icns MyIcon.iconset
rm -R MyIcon.iconset
cp MyIcon.icns $NAME.app/Contents/Resources/Icon.icns



# Now edit the App
# heredoc syntax for echo

echo "#!/bin/bash" > $NAME.app/Contents/MacOS/App
# echo "open -a Firefox $URI" >> $NAME.app/Contents/MacOS/App
echo "OPEN_DAPP="$NAME,/Users/liamz/Documents/Projects/dappnet/macos-app-shortcuts/$ICON,$URI" open -a /Users/liamz/Documents/Projects/dappnet/desktop-app/dist/mac/Dappnet.app/Contents/MacOS/Dappnet" >> $NAME.app/Contents/MacOS/App

chmod +x $NAME.app/Contents/MacOS/App



cp -R $NAME.app /Volumes/Untitled/
cp -R /Volumes/Untitled/$NAME.app .