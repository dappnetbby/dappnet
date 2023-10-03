rm MyIcon.icns
mkdir MyIcon.iconset/
sips -z 16 16     uniswap.png --out MyIcon.iconset/icon_16x16.png
sips -z 32 32     uniswap.png --out MyIcon.iconset/icon_16x16@2x.png
sips -z 32 32     uniswap.png --out MyIcon.iconset/icon_32x32.png
sips -z 64 64     uniswap.png --out MyIcon.iconset/icon_32x32@2x.png
sips -z 128 128   uniswap.png --out MyIcon.iconset/icon_128x128.png
sips -z 256 256   uniswap.png --out MyIcon.iconset/icon_128x128@2x.png
sips -z 256 256   uniswap.png --out MyIcon.iconset/icon_256x256.png
sips -z 512 512   uniswap.png --out MyIcon.iconset/icon_256x256@2x.png
sips -z 512 512   uniswap.png --out MyIcon.iconset/icon_512x512.png
iconutil -c icns MyIcon.iconset
rm -R MyIcon.iconset
cp MyIcon.icns Uniswap.app/Contents/Resources/Icon.icns