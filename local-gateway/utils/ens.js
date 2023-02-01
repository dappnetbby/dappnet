#!/usr/bin/env node

// http://cid.ipfs.tech.ipns.localhost:8080/#bafzaajaiaejcbnv5mskob2urbu3uldds35j4pt4ux7gsqzmfgnb6qpi3qnprtu6s

const { resolveENS, resolveIPNS } = require('../src/ens')
const bs58 = require('bs58')

const { resolve: resolveDNSLink, DNSRcodeError } = require('@dnslink/js')
const { wellknown } = require('dns-query')
const IpfsHttpClient = require('ipfs-http-client')

let _endpoints = null
async function getDNSEndpoints() {
    if (_endpoints) {
        return _endpoints
    }

    // A set of well-known DNS-over-HTTPS (DoH) endpoints.
    _endpoints = await wellknown.endpoints('doh')
    return _endpoints
}

async function getContentHash(argv) {
    console.time('getContentHash')
    const { name } = argv
    const data = await resolveENS(name)
    const { codec, hash, contentHashHex, dnsLinkName } = data
    if(codec == null || hash == null) {
        console.log(`null`)
        return
    }

    if(codec == 'ipns-ns') {
        // const ipfsHttpClient = IpfsHttpClient.create('http://localhost:5001/api/v0')
        const ipfsHttpClient = IpfsHttpClient.create('http://localhost:5001/api/v0')
        const ipnsPath = await resolveIPNS(ipfsHttpClient, `/ipns/${hash}`)
        console.log(`ipnsPath:`, ipnsPath)
    }

    let hashDecoded = bs58.decode(hash)
    console.log(`contentHash: ${contentHashHex.slice(2)}`)
    console.log(`codec: ${codec}`)
    console.log(`hash: ${hash}`)
    console.log(`hash (hex): ${Buffer.from(hashDecoded).toString('hex')}`)
    console.log(`hash (raw str): ${JSON.stringify(Buffer.from(hashDecoded).toString())}`)
    console.log(`dnsLinkName: ${dnsLinkName}`)

    if (dnsLinkName) {
        let dnsLinkRes = await resolveDNSLink(dnsLinkName, {
            endpoints: await getDNSEndpoints()
        })
        console.log(dnsLinkRes)
        console.log('dnsLink entries:')
        dnsLinkRes.links.ipfs.map(entry => {
            console.log(`- ${entry.identifier} (ttl=${entry.ttl})`)
        })
        // console.log(dnsLinkRes)
    }

    console.timeEnd('getContentHash')
    
}

require('yargs')
    .scriptName("ens")
    .usage('$0 <cmd> [args]')
    .command('contenthash [name]', 'get contenthash of ens name, printed nicely', (yargs) => {
        yargs.positional('name', {
            type: 'string',
            describe: 'the ENS domain name'
        })
    }, getContentHash)
    .help()
    .argv


