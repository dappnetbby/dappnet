import * as LocalGateway from '@dappnet/local-gateway';
import { spawn, spawnSync } from 'node:child_process';
import * as path from 'node:path';
import * as sourceMap from 'source-map-support';
sourceMap.install();
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ipfsConfigForFastTeens } from '../ipfs-configs/ipfs';
import chalk from 'chalk'

async function main({ appPath, appDataPath }) {
    // Launch the .eth -> IPFS gateway.
    const ensGateway = LocalGateway.start();
}

const {} = process.env
const config = {}

main(config).catch(err => {
    throw err
})