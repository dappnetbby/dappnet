
### Using your own IPFS node.

You can run your own IPFS node locally, and use it with Dappnet!

```sh
# Development
ELECTRON_IS_DEV=0 npm run start -- --ipfs-node http://localhost:8080

# Packaged
./dist/mac-arm64/Dappnet.app/Contents/MacOS/Dappnet --ipfs-node http://localhost:8080
```