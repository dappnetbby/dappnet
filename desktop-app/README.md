desktop-app
===========

The Dappnet app for macOS.

## Architecture.

Dappnet's desktop app is built using the [Electron](https://www.electronjs.org/) runtime. This is a good cross-platform base for a UI, and interoperates well with the local ENS gateway, which is written in Node.js. 

We use Typescript's compiler for a modern JS featureset, and maximise productivity with the JS module ecosystem. A lot of modules for JS are now written using the ESM import syntax, which produces all sorts of issues with tooling. Using `tsc` solves that.

The app is built and published using [Electron Builder](https://www.electron.build/). New versions of the app are published to Github releases, under the `liamzebedee/test1717` repo. Electron has a built-in updating framework for macOS and Windows, based on a framework called [Squirrel](https://github.com/Squirrel/Squirrel.Mac). We use the [update-electron-app](https://github.com/electron/update-electron-app) module to automatically download and install these updates, and [Hazel](https://github.com/vercel/hazel) as an update server. The update server is contained in [liamzebedee/dappnet-update-server](https://github.com/liamzebedee/dappnet-update-server), and hosted on Vercel.

The UI for this app, although small, is developed using [Next.js](https://nextjs.org/) and React. It's compiled into a static bundle for distribution. 

## Setup.

To get developing, you will need to:

 - download an ipfs binary.
 - compile the local socks5 proxy.
 - build the UI.
 - install the certificate authority for .eth.
 - compile the desktop app (using typescript)

### 1. Download IPFS binary.

The desktop app bundles a local IPFS node, which you will have to download the binary for.

```sh
./scripts/vendor/get-ipfs.sh
```

### 2. Compile the local SOCKS5 proxy.

```sh
cd ../local-socks5-proxy-rs

# We build for mac x64, since this runs on both M1 and Intel chips.
rustup target add x86_64-apple-darwin
cargo build --release --target=x86_64-apple-darwin

cp ./target/release/merino ../desktop-app/vendor/local-proxy/merino
```

### 3. Build the UI.

The UI is developed using Next.js/React in a separate folder - `ui/`. 

Compile these assets once, so the Electron app can use them:

```sh
cd ui/
npm i 
npm run build
npm run export
```

### 4. Install the .eth Certificate Authority.

This step is unnecessary if you have already installed the Dappnet desktop `.pkg`.

If you haven't already installed it, you will need to add the .eth CA to your System Keychain.

```sh
./scripts/mac/add-ca.sh
```


### 5. Compile and run.

Install dependencies:

```sh
npm i
```

Run:

```sh
# Term 1: TypeScript build server.
npm run watch

# Term 2: Electron app launcher.
npm run dev
```

### Testing the `.app`.

You can generate a local Dappnet.app fairly easily:

```sh
(base) ➜  desktop-app git:(master) ✗ SKIP_NOTARIZE=1 npm run pack

> @dappnet/desktop-app@1.3.0 pack
> electron-builder

  • electron-builder  version=23.6.0 os=21.6.0
  • loaded configuration  file=/Users/liamz/Documents/Projects/dappnet/desktop-app/electron-builder.yml
  • writing effective config  file=dist/builder-effective-config.yaml
  • packaging       platform=darwin arch=x64 electron=20.1.4 appOutDir=dist/mac
  • Signing addtional user-defined binaries: [
 "vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs"
]
  • signing         file=dist/mac/Dappnet.app identityName=Developer ID Application: Liam Edwards-Playne (2S6NXP6BKG) identityHash=25109B43666B81C79E338E3DBFC83DFBF2BD703D provisioningProfile=none
  • building        target=pkg arch=x64 file=dist/Dappnet-1.3.0.pkg
  • building        target=DMG arch=x64 file=dist/Dappnet-1.3.0.dmg
  • building        target=macOS zip arch=x64 file=dist/Dappnet-1.3.0-mac.zip
  • Detected arm64 process, HFS+ is unavailable. Creating dmg with APFS - supports Mac OSX 10.12+
  • building block map  blockMapFile=dist/Dappnet-1.3.0-mac.zip.blockmap
  • building block map  blockMapFile=dist/Dappnet-1.3.0.dmg.blockmap
```

And run it as so:

```sh
(base) ➜  desktop-app git:(master) ✗ ./dist/mac/Dappnet.app/Contents/MacOS/Dappnet
```

## Publish and release.

Configure your environment.

```sh
cp .env.example .env
```

Now publish.

```sh
source .env
npm run publish
```

This will engage multiple steps:

 - building the app.
 - packaging it into .app, .dmg.
 - notarizing and signing. This essentially sends the app to Apple, where they link it with your developer account. In return, you get a ticket.
 - publishing it to github. A new release is created, and the files are uploaded.

You should see something like:

```sh
(base) ➜  desktop-app git:(master) ✗ npm run publish

> @dappnet/desktop-app@1.3.3 publish
> electron-builder --publish always

  • electron-builder  version=23.6.0 os=21.6.0
  • loaded configuration  file=/Users/liamz/Documents/Projects/dappnet/desktop-app/electron-builder.yml
  • writing effective config  file=dist/builder-effective-config.yaml
  • packaging       platform=darwin arch=x64 electron=20.1.4 appOutDir=dist/mac
  • Signing addtional user-defined binaries: [
 "vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs"
]
  • signing         file=dist/mac/Dappnet.app identityName=Developer ID Application: Liam Edwards-Playne (2S6NXP6BKG) identityHash=25109B43666B81C79E338E3DBFC83DFBF2BD703D provisioningProfile=none
  • building        target=pkg arch=x64 file=dist/Dappnet-1.3.3.pkg
  • building        target=DMG arch=x64 file=dist/Dappnet-1.3.3.dmg
  • building        target=macOS zip arch=x64 file=dist/Dappnet-1.3.3-mac.zip
  • Detected arm64 process, HFS+ is unavailable. Creating dmg with APFS - supports Mac OSX 10.12+
  • building block map  blockMapFile=dist/Dappnet-1.3.3-mac.zip.blockmap
  • publishing      publisher=Github (owner: liamzebedee, project: test1717, version: 1.3.3)
  • uploading       file=Dappnet-1.3.3-mac.zip.blockmap provider=github
  • uploading       file=Dappnet-1.3.3-mac.zip provider=github
  • creating GitHub release  reason=release doesn't exist tag=v1.3.3 version=1.3.3
    [=                   ] 3% 165.5s | Dappnet-1.3.3-mac.zip to github  • building block map  blockMapFile=dist/Dappnet-1.3.3.dmg.blockmap
    [=                   ] 5% 148.9s | Dappnet-1.3.3-mac.zip to github  • uploading       file=Dappnet-1.3.3.dmg.blockmap provider=github
  • uploading       file=Dappnet-1.3.3.dmg provider=github
    [====================] 100% 0.0s | Dappnet-1.3.3-mac.zip to github
    [====================] 100% 0.0s | Dappnet-1.3.3.dmg to github
    [====================] 100% 0.0s | Dappnet-1.3.3.pkg to github
```

The final step is going onto the [releases page](https://github.com/liamzebedee/test1717/releases) and **changing the release status from draft to release**.

After this, the Hazel update server picks up the new release.