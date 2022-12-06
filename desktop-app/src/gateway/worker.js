const {
    Worker, isMainThread, parentPort, workerData,
} = require('node:worker_threads');

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


async function setupIpfs({ appPath, appDataPath }) {
    const gatewayOptions = {};

    // mock until I've got yargs in.
    const argv = {}
    if (argv['ipfs-node']) {
        gatewayOptions.ipfsNodeURL = arguments_['ipfs-node'];
    } else {
        // Start local IPFS node.
        // const appPath = app.getAppPath()
        const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked')
        const ipfsBinaryPath = path.join(appPathUnpacked, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        // let ipfsPath
        // if (electronIsDev) {
        //     ipfsPath = path.join(appPath, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        // } else {
        //     ipfsPath = path.join(asarUnpackedPath, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        // }

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
            spawnSync(ipfsBinaryPath, [`init`], { env, stdio: 'inherit' })

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

        const run = (cmd, args) => {
            const ipfs = spawn(
                cmd,
                args.split(' '),
                { env, stdio: 'inherit' }
            );

            // ipfs.stdout.on('data', (data) => {
            //     console.log(`[${cmd}] ${data}`);
            // });

            // ipfs.stderr.on('data', (data) => {
            //     console.error(`[${cmd}] ${data}`);
            // });

            ipfs.on('close', (code) => {
                if (code !== 0) {
                    console.log(`[${cmd}] process exited with code ${code}`);
                }
            });
        }

        console.log(`IPFS: starting the daemon`)
        run(ipfsBinaryPath, `daemon --stream-channels --enable-namesys-pubsub --enable-gc --manage-fdlimit`)
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
        console.log(id);

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

    const enableLocalIpfsHttpClient = true;
    if (enableLocalIpfsHttpClient) {
        const ipfsNode = IPFSHttpClient.create({
            url: 'http://127.0.0.1:5001',
        });
        gatewayOptions.ipfsNode = ipfsNode;
        gatewayOptions.ipfsNodeURL = 'http://localhost:5001';
    }

    return { gatewayOptions };
}

async function main() {
    // Setup the IPFS node.
    const { gatewayOptions } = await setupIpfs(workerData);

    // Launch the .eth/IPFS gateway.
    const ensGateway = LocalGateway.start(gatewayOptions);

    // Launch SOCKS5 proxy server.
    const socksServer = LocalSocksProxy.start();
}


if (isMainThread) {
    module.exports = function (workerData) {
        const worker = new Worker(__filename, {
            workerData,
        });

        return worker

        // return new Promise((resolve, reject) => {
        //     const worker = new Worker(__filename, {
        //         workerData,
        //     });
        //     worker.on('message', resolve);
        //     worker.on('error', reject);
        //     worker.on('exit', (code) => {
        //         if (code !== 0)
        //             reject(new Error(`Worker stopped with exit code ${code}`));
        //     });
        // });
    };
} else {
    main()
}