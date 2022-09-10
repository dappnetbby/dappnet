#!/usr/bin/env node

const { resolveENS } = require('../src/ens')
const bs58 = require('bs58')

const { resolve: resolveDNSLink, DNSRcodeError } = require('@dnslink/js')
const { wellknown } = require('dns-query')

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
    const { codec, hash, dnsLinkName } = data
    if(codec == null || hash == null) {
        console.log(`null`)
        return
    }
    let hashDecoded = bs58.decode(hash)
    console.log(`codec: ${codec}\nhash: ${hash}\nhash (hex): ${Buffer.from(hashDecoded).toString('hex')}\ndnsLinkName: ${dnsLinkName}`)

    if (dnsLinkName) {
        let dnsLinkRes = await resolveDNSLink(dnsLinkName, {
            endpoints: await getDNSEndpoints()
        })
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


