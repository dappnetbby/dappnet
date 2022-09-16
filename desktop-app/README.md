desktop-app
===========

The Dappnet app for macOS.

Built using Electron. The UI is rendered using Next.js in `ui/`.

## Build.

```sh
npm i

# Term 1:
npm run watch

# Term 2:
npm run start

# The UI is a separate server.
# If you want to dev on that:
# Term 3:
cd ui/
npm i
npm run start

# and run in Term 2:
UI_DEV=1 npm run start
```

You can use the statically built frontend in `ui/out/` by adding the `ELECTRON_IS_DEV=0` flag, to mock that we are running as a packaged app environment.

### Using your own IPFS node.

You can run your own IPFS node locally, and use it with Dappnet!

```sh
# Development
ELECTRON_IS_DEV=0 npm run start -- --ipfs-node http://localhost:8080

# Packaged
./dist/mac-arm64/Dappnet.app/Contents/MacOS/Dappnet --ipfs-node http://localhost:8080
```

## Publish.

```sh
npm run pack

ELECTRON_ENABLE_LOGGING=true

# macOS
./dist/mac-arm64/Dappnet.app/Contents/MacOS/Dappnet
```

