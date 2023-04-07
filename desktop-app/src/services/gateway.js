import * as LocalGateway from '@dappnet/local-gateway';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import path from 'node:path'
import { env } from '../config';

async function main({ appPath, appDataPath, data }) {
    // Find the path to the certificate info.
    const dappnetCADataPath = path.join(appDataPath, '/Dappnet/data/')

    // Launch the .eth -> IPFS gateway.
    const {
        telemetry
    } = data

    const ensGateway = LocalGateway.start({
        dappnetCADataPath,
        telemetryConfig: telemetry,
    });
}

const { APP_PATH, APP_DATA_PATH, DATA } = process.env
const config = {
    appPath: APP_PATH,
    appDataPath: APP_DATA_PATH,
    data: JSON.parse(DATA)
}

main(config).catch(err => {
    throw err
})