import * as LocalSocksProxy from '@dappnet/local-socks5-proxy';
import * as path from 'node:path';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import chalk from 'chalk'
import { runBinary } from '../utils'

const startLocalSocksProxyRust = ({ appPath }) => {
    // cargo run -- --no-auth --port 6801
    const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked')
    const binaryPath = path.join(appPathUnpacked, `/vendor/local-proxy/merino`)
    runBinary(binaryPath, `--no-auth --port 6801`, {}, 'socks5-proxy')
}

async function main({ appPath, appDataPath }) {
    // Launch SOCKS5 proxy server.
    // There are two approaches:
    // - Rust
    // - JS
    // The Rust server seems to underperform on concurrent connections ironnically.
    // The JS server is more performant.

    // startLocalSocksProxyRust({ appPath })
    LocalSocksProxy.start()
    
    // TODO kill on exit.
}

const { APP_PATH, APP_DATA_PATH } = process.env
const config = {
    appPath: APP_PATH,
    appDataPath: APP_DATA_PATH
}
main(config).catch(err => {
    throw err
})