import * as LocalSocksProxy from '@dappnet/local-socks5-proxy';
import * as path from 'node:path';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import chalk from 'chalk'
import { runBinary } from '../utils'
import { spawn, spawnSync } from 'node:child_process';

async function main({ appPath, appDataPath }) {
    const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked')

    // TODO check GOOS-GOARCH, run macos-arm64 if possible.
    const binaryPath = path.join(appPathUnpacked, `/bin/socks5-proxy`)
    runBinary(binaryPath, '', {}, 'socks5-proxy')
}

const { APP_PATH, APP_DATA_PATH } = process.env
const config = {
    appPath: APP_PATH,
    appDataPath: APP_DATA_PATH
}

main(config).catch(err => {
    throw err
})