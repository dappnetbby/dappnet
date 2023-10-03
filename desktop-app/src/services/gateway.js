import * as LocalGateway from '@dappnet/local-gateway';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import path from 'node:path'
import { env } from '../config';
import { runBinary } from '../utils'

import { spawn, spawnSync } from 'node:child_process';


async function main({ appPath, appDataPath, data }) {
    // Find the path to the certificate info.
    const dappnetCADataPath = path.join(appDataPath, '/Dappnet/data/')

    // Locate the ipfs binary.
    const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked')

    // TODO check GOOS-GOARCH, run macos-arm64 if possible.
    const binaryPath = path.join(appPathUnpacked, `/bin/local-gateway`)

    runBinary(binaryPath, '', {}, 'local-gateway')
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