desktop-app
===========

The Dappnet app for macOS.

## Architecture.

Dappnet's desktop app is built using the [Electron](https://www.electronjs.org/) runtime. This is a good cross-platform base for a UI, and interoperates well with the local ENS gateway, which is written in Node.js. 

We use Typescript's compiler for a modern JS featureset, and maximise productivity with the JS module ecosystem. A lot of modules for JS are now written using the ESM import syntax, which produces all sorts of issues with tooling. Using `tsc` solves that.

The app is built and published using [Electron Builder](https://www.electron.build/). New versions of the app are published to Github releases, under the `liamzebedee/dappnet` repo. Electron has a built-in updating framework for macOS and Windows, based on a framework called [Squirrel](https://github.com/Squirrel/Squirrel.Mac). We use the [update-electron-app](https://github.com/electron/update-electron-app) module to automatically download and install these updates, and [Hazel](https://github.com/vercel/hazel) as an update server. The update server is contained in [liamzebedee/dappnet-update-server](https://github.com/liamzebedee/dappnet-update-server), and hosted on Vercel.

The UI for this app, although small, is developed using [Next.js](https://nextjs.org/) and React. It's compiled into a static bundle for distribution. 

## Setup.

To get developing, you will need to:

 - download an ipfs binary.
 - build the UI.
 - install the certificate authority for .eth.

### 1. Download IPFS binary.

The desktop app bundles a local IPFS node, which you will have to download the binary for.

```sh
cd vendor/
wget https://dist.ipfs.tech/go-ipfs/v0.13.0/go-ipfs_v0.13.0_darwin-amd64.tar.gz
tar -xvzf go-ipfs_v0.13.0_darwin-amd64.tar.gz
chmod +x go-ipfs/ipfs
mkdir -p ./ipfs/go-ipfs_v0.13.0_darwin-amd64/
mv go-ipfs/ipfs ./ipfs/go-ipfs_v0.13.0_darwin-amd64/
# cleanup
rm -rf go-ipfs go-ipfs_v0.13.0_darwin-amd64.tar.gz
```

### 2. Build the UI.

The UI is developed using Next.js/React in a separate folder - `ui/`. 

Compile these assets once, so the Electron app can use them:

```sh
cd ui/
npm i 
npm run build
npm run export
```

### 3. Install the .eth Certificate Authority.

This step is unnecessary if you have already installed the Dappnet desktop `.pkg`.

If you haven't already installed it, you will need to add the .eth CA to your System Keychain.

```sh
./scripts/mac/add-ca.sh
```


## Develop.

Install dependencies:

```sh
npm i
```

Run:

```sh
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

