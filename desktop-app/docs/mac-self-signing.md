## Your own signing

 - https://www.electron.build/code-signing.html
 - https://github.com/electron-userland/electron-builder/issues/3870
 - https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/

## Notarizing and signing.

```sh
(base) ➜  desktop-app git:(dev) ✗ xcrun notarytool submit dist/Dappnet-1.7.0-arm64.pkg --apple-id liamzebedee@yahoo.com.au --password "kbzw-prkj-lfoj-smdj" --team-id 2S6NXP6BKG --wait
Conducting pre-submission checks for Dappnet-1.7.0-arm64.pkg and initiating connection to the Apple notary service...
Submission ID received
  id: 53417843-31c2-46be-8cc8-0ea7f3d621b8
Upload progress: 100.00% (129 MB of 129 MB)
Successfully uploaded file
  id: 53417843-31c2-46be-8cc8-0ea7f3d621b8
  path: /Users/liamz/Documents/Projects/dappnet/desktop-app/dist/Dappnet-1.7.0-arm64.pkg
Waiting for processing to complete.
Current status: Accepted.....................
Processing complete
  id: 53417843-31c2-46be-8cc8-0ea7f3d621b8
  status: Accepted
```

Checking the notarization:

```sh
(base) ➜  desktop-app git:(dev) ✗ spctl -a -vvv -t install dist/Dappnet-1.7.0-arm64.pkg
dist/Dappnet-1.7.0-arm64.pkg: accepted
source=Notarized Developer ID
origin=Developer ID Installer: Liam Edwards-Playne (2S6NXP6BKG)
```

Staple the ticket:

```sh
(base) ➜  desktop-app git:(dev) ✗ xcrun stapler staple dist/Dappnet-1.7.1-dev.pkg
Processing: /Users/liamz/Documents/Projects/dappnet/desktop-app/dist/Dappnet-1.7.1-dev.pkg
Processing: /Users/liamz/Documents/Projects/dappnet/desktop-app/dist/Dappnet-1.7.1-dev.pkg
The staple and validate action worked!
```

## Self-signing

```sh
# disable gatekeeper
sudo spctl --master-disable
sudo spctl --status

# now build and notarize.

# re-enable.
sudo spctl --master-enable
```

## @electron/signing

```sh
# export DEBUG=electron-osx-sign*
export DEBUG=*
npx electron-builder
```