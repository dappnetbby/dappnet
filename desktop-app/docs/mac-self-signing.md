## Your own signing

https://kilianvalkhof.com/2019/electron/notarizing-your-electron-application/

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