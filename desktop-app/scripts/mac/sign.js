const { signAsync } = require('@electron/osx-sign')
console.log(__dirname)

async function run() {
    try {
        console.log('Signing')
        await signAsync({
            app: 'dist/mac-arm64/Dappnet.app',
            identity: process.env.MAC_CS_IDENITTY,
            // binaries: [
            //     'Resources/app.asar.unpacked/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs'
            // ]
        })
    } catch(err) {
        throw err
    }
}

run().catch(err => { throw err })

