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

const startLocalSocksProxyRust = ({ appPath }) => {
    // cargo run -- --no-auth --port 6801
    const appPathUnpacked = appPath.replace('app.asar', 'app.asar.unpacked')
    const binaryPath = path.join(appPathUnpacked, `/vendor/local-proxy/merino`)
    runBinary(binaryPath, `--no-auth --port 6801`, {}, 'socks5-proxy')
}

const LocalSocksProxyRust = {
    start: startLocalSocksProxyRust
}

async function main({ appPath, appDataPath }) {
    // Launch SOCKS5 proxy server.
    // LocalSocksProxyRust.start({ appPath })
    LocalSocksProxy.start()
    // TODO kill on exit.
}

// module.exports = async function(config) {
//     await main(config)
// }

// Started from CLI.
const { APP_PATH, APP_DATA_PATH } = process.env
const config = {
    appPath: APP_PATH,
    appDataPath: APP_DATA_PATH
}
main(config).catch(err => {
    throw err
})