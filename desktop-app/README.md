desktop-app
===========

The Dappnet app for macOS.

Built using Electron.

## Build.

```sh
npm i

npm link ../local-gateway
npm link ../local-socks5-proxy

# Term 1:
npm run start

# Term 2:
cd ui/
npm i
npm run start
```

## Publish.

```sh
npm run pack

ELECTRON_ENABLE_LOGGING=true

# macOS
./dist/mac-arm64/Dappnet.app/Contents/MacOS/Dappnet
```

