desktop-app
===========

The Dappnet app for macOS.

## Setup.

### Local IPFS node.

The desktop app bundles a local IPFS node, which you will have to download the binary for.

```sh
cd vendor/
wget https://dist.ipfs.tech/go-ipfs/v0.13.0/go-ipfs_v0.13.0_darwin-amd64.tar.gz
tar -xvzf go-ipfs_v0.13.0_darwin-amd64.tar.gz
chmod +x go-ipfs/ipfs
mkdir -p ./ipfs/go-ipfs_v0.13.0_darwin-amd64/
mv go-ipfs/ipfs ./ipfs/go-ipfs_v0.13.0_darwin-amd64/
```

### UI.

The UI is developed using Next.js/React in a separate folder - `ui/`. 

Compile these assets once, so the Electron app can use them:

```sh
cd ui/
npm i 
npm run build
npm run export
```

### Certificate authority.

If you haven't already installed it, you will need to add the .eth CA to your System Keychain.

```sh
./Users/liamz/Documents/Projects/dappnet/desktop-app/scripts/mac/add-ca.sh
```

## Develop.

Once you've done setup, development is as simple as this:

```sh
npm i

# Term 1: TypeScript server.
npm run watch

# Term 2: Electron app launcher.
npm run start
```

## Publish.

Publishing will build a .pkg installer for macOS, that auto-installs the CA.

```sh
npm run pack
```

