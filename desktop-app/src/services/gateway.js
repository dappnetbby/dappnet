import * as LocalGateway from '@dappnet/local-gateway';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import path from 'node:path'

async function main({ appPath, appDataPath }) {
    // Find the path to the certificate info.
    const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked')
    const dappnetCADataPath = path.join(appPathUnpacked, `/node_modules/@dappnet/local-gateway/dappnet-ca/data/`)
    console.log(`dappnetCADataPath: ${dappnetCADataPath}`)

    // Launch the .eth -> IPFS gateway.
    const ensGateway = LocalGateway.start({ dappnetCADataPath });
}

const { APP_PATH, APP_DATA_PATH } = process.env
const config = {
    appPath: APP_PATH,
    appDataPath: APP_DATA_PATH
}

main(config).catch(err => {
    throw err
})