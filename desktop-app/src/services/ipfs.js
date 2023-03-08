import * as LocalGateway from '@dappnet/local-gateway';

import { spawn, spawnSync } from 'node:child_process';
import * as path from 'node:path';
import * as sourceMap from 'source-map-support';
sourceMap.install();


import * as _ from 'lodash';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ipfsConfigForFastTeens } from '../ipfs-configs/peers';
import chalk from 'chalk'
import { runBinary } from '../utils'

async function setupIpfs({ appPath, appDataPath }) {
    if (process.env.DEV_IPFS) {
        // Do nothing.
        return
    }

    // Locate the ipfs binary.
    const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked')
    // TODO swap to arm64.
    const ipfsBinaryPath = path.join(appPathUnpacked, `/vendor/ipfs/kubo_v0.18.1_darwin-amd64/ipfs`)

    console.log(`appPathUnpacked`, appPathUnpacked)
    console.log('execPath', process.execPath);
    console.log(`ipfsPath`, ipfsBinaryPath);

    // Locate the IPFS data directory.
    // 
    // The userData directory looks like:
    // macOS:   ~/Library/Application Support/Dappnet/
    // Linux:   ~/.config/Dappnet
    // Windows: %APPDATA%\Dappnet
    // 
    // You can get it using `app.getPath('appData')`.
    const userDataDir = appDataPath

    // Location of the ipfs data directory, which is ordinarily ~/.ipfs.
    const IPFS_PATH = path.join(userDataDir, '/.ipfs/')
    const IPFS_CONFIG_PATH = join(IPFS_PATH, '/config')

    // Setup environment for IPFS.
    const env = { IPFS_PATH }
    console.log(`IPFS_PATH`, IPFS_PATH)
    console.log(`IPFS_CONFIG_PATH`, IPFS_CONFIG_PATH)

    // If the IPFS config doesn't exist, initialize the node.
    if (!existsSync(IPFS_CONFIG_PATH)) {
        console.log(`IPFS: no config, initializing the node`)

        // Initialize IPFS, creating a config file.
        spawnSync(ipfsBinaryPath, [`init`], { env, stdio: 'pipe' })

        // Sanity check: does config exist?
        if (!existsSync(IPFS_CONFIG_PATH)) {
            throw new Error("IPFS config was not generated after running `ipfs init`, meaning something went wrong.")
        }

        // Now add custom peers (ie. Cloudflare) to make it fast.
        // See: https://docs.ipfs.tech/how-to/peering-with-content-providers/#content-provider-list
        // NOTE: `Peers` config option is NOT supported by the js-ipfs node.
        const ipfsConfig = JSON.parse(readFileSync(IPFS_CONFIG_PATH, { encoding: "utf-8" }))

        let existingPeers = _.get(ipfsConfig, "Peering.Peers", [])
        if (existingPeers == null) {
            // FFS, why couldn't they just set this to an empty array?
            existingPeers = []
        }

        const peers =
            _.set(
                ipfsConfig,
                "Peering.Peers",
                [...existingPeers, ...ipfsConfigForFastTeens.Peering.Peers]
            )

        // Write out the new config.
        writeFileSync(IPFS_CONFIG_PATH, JSON.stringify(ipfsConfig, null, 2))

        console.log(`IPFS: initialization done`)
    }

    // Run `ipfs daemon`.
    console.log(`IPFS: starting the daemon`)
    runBinary(ipfsBinaryPath, `daemon`, env, 'ipfs')
}

async function main({ appPath, appDataPath }) {
    console.log(`APP_PATH:`, appPath)
    console.log(`APP_DATA_PATH:`, appDataPath)

    // Setup the IPFS node.
    await setupIpfs({ appPath, appDataPath });
}

const { APP_PATH, APP_DATA_PATH } = process.env
const config = {
    appPath: APP_PATH,
    appDataPath: APP_DATA_PATH
}
main(config).catch(err => {
    throw err
})