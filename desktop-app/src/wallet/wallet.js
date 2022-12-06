// This implements a Metamask-like provider for the Dappnet client.
// Behind the scenes, it's basically ethers.js + a Cloudflare RPC node.
// 
// A couple standards related to this:
// https://eips.ethereum.org/EIPS/eip-1102
// https://eips.ethereum.org/EIPS/eip-1193#specification
// https://eips.ethereum.org/EIPS/eip-1474
// 

const {
    Worker, isMainThread, parentPort, workerData,
} = require('node:worker_threads');

import * as ethers from 'ethers'
import { Eip1193Bridge } from "./eip1193";
import { ipcMain } from 'electron';

function startWorker(workerData) {
    const worker = new Worker(__filename, {
        workerData,
    });

    worker.stdout.pipe(process.stdout);
    worker.stderr.pipe(process.stderr);

    return worker
}

async function main() {
    const provider = new ethers.providers.InfuraProvider()
    let wallet = ethers.Wallet.createRandom()
    if(process.env.TEST_WALLET_PRVKEY) {
        wallet = new ethers.Wallet(process.env.TEST_WALLET_PRVKEY)
    }
    const signer = wallet
    const eip1193Provider = new Eip1193Bridge(signer, provider);

    parentPort.on('message', async (msg) => {
        const { argsStr, id } = msg

        const args = JSON.parse(argsStr)
        console.log(`ethereum-request(`, args, `)`)

        // forward to the eip1193Provider
        const res = await eip1193Provider.request.apply(eip1193Provider, args)
        console.log(`ethereum-request(`, args, `)`, `->`, res)

        // send result back to the parent
        parentPort.postMessage({
            id,
            res
        })
    });
}

if (isMainThread) {
    module.exports = startWorker
} else {
    main()
}