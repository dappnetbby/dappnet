import * as LocalGateway from '@dappnet/local-gateway';
import * as LocalSocksProxy from '@dappnet/local-socks5-proxy';

import { spawn, spawnSync } from 'node:child_process';
import * as path from 'node:path';
import * as sourceMap from 'source-map-support';
sourceMap.install();

import * as IPFSHttpClient from 'ipfs-http-client';

import * as _ from 'lodash';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ipfsConfigForFastTeens } from '../ipfs';
import chalk from 'chalk'

const runBinary = (cmd, args, env, label) => {
    console.log(`launching ${chalk.yellow(label)}`)

    console.log(`[exec] ${cmd} ${args}`)
    const program = spawn(
        cmd,
        args.split(' '),
        {
            env: {
                ...env,
                FORCE_COLOR: true
            },
            stdio: 'pipe'
        }
    );

    program.stdout.on('data', (data) => {
        console.log(`[${chalk.yellow(label)}] ${data}`);
    });

    program.stderr.on('data', (data) => {
        console.log(`[${chalk.yellow(label)}] ${data}`);
    });

    program.on('close', (code) => {
        if (code !== 0) {
            console.log(`[${cmd}] process exited with code ${code}`);
        }
    });
}

async function setupIpfs({ appPath, appDataPath }) {
    const gatewayOptions = {};

    // mock until I've got yargs in.
    const argv = {}
    if (argv['ipfs-node']) {
        gatewayOptions.ipfsNodeURL = arguments_['ipfs-node'];
    } else if (process.env.DEV_IPFS) {
        // Do nothing.
        return {
            ipfsNodeURL: "http://localhost:5001"
        }

    } else {
        // Start local IPFS node.
        const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked')
        // const ipfsBinaryPath = path.join(appPathUnpacked, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        const ipfsBinaryPath = path.join(appPathUnpacked, `/vendor/ipfs/go-ipfs_v0.18.2_darwin-arm64/ipfs`)

        console.log(`appPathUnpacked`, appPathUnpacked)
        console.log('execPath', process.execPath);
        console.log(`ipfsPath`, ipfsBinaryPath);

        // The userData directory is like:
        // macOS: ~/Library/Application Support/Dappnet/
        // Linux: ~/.config/Dappnet
        // Windows: %APPDATA%\Dappnet
        // const userDataDir = app.getPath('appData')
        const userDataDir = appDataPath
        // Location of the ipfs data directory, which is ordinarily ~/.ipfs.
        const IPFS_PATH = path.join(userDataDir, '/.ipfs/')
        const IPFS_CONFIG_PATH = join(IPFS_PATH, '/config')

        const env = { IPFS_PATH }

        console.log(`IPFS_PATH`, IPFS_PATH)
        console.log(`IPFS_CONFIG_PATH`, IPFS_CONFIG_PATH)

        if (!existsSync(IPFS_CONFIG_PATH)) {
            console.log(`IPFS: no config, initializing the node`)

            // Initialize IPFS, creating a config file.
            spawnSync(ipfsBinaryPath, [`init`], { env, stdio: 'pipe' })

            // Sanity check it worked.
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


        console.log(`IPFS: starting the daemon`)
        runBinary(ipfsBinaryPath, `daemon`, env, 'ipfs')
    }

    const enableLocalIpfsNode = false;
    if (enableLocalIpfsNode) {
        // Launch the IPFS node.
        const ipfsNode = await IPFSCore.create({
            start: true,
            // config: {
            //     // https://docs.ipfs.tech/how-to/peering-with-content-providers/#content-provider-list
            //     // Bootstrap: [
            //     //     "/dnsaddr/node-8.ingress.cloudflare-ipfs.com",
            //     //     "/dns/cluster0.fsn.dwebops.pub",
            //     //     "/ip4/139.178.68.217/tcp/6744"
            //     // ]
            // },
            EXPERIMENTAL: {
                ipnsPubsub: true,
            },
        });
        const id = await ipfsNode.id();
        // console.log(id);

        // const ipfsPath = "/ipfs/QmTau1nKy3axaPKU866BWkf8CfaiKrMYWXC5sVUVpJRSgW/"
        // async function thing() {
        //     const ipfsPath = "QmTau1nKy3axaPKU866BWkf8CfaiKrMYWXC5sVUVpJRSgW"
        //     for await (const chunk of ipfsNode.get(ipfsPath)) {
        //         console.info('c', chunk)
        //     }
        // }
        // thing()

        gatewayOptions.ipfsNode = ipfsNode;
    }

    return { gatewayOptions };
}

async function main({ appPath, appDataPath }) {
    console.log(`APP_PATH:`, appPath)
    console.log(`APP_DATA_PATH:`, appDataPath)

    // Setup the IPFS node.
    const { gatewayOptions } = await setupIpfs({ appPath, appDataPath });
}

// Started from CLI.
const { APP_PATH, APP_DATA_PATH } = process.env
const config = {
    appPath: APP_PATH,
    appDataPath: APP_DATA_PATH
}
main(config).catch(err => {
    throw err
})