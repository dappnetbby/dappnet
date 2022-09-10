const contentHash = require('content-hash')
// const Multihash = require('@liamzebedee/multihashes')

const { namehash } = require("@ethersproject/hash")
const ethers = require('ethers')
const bs58 = require('bs58')

// Provider setup.
const provider = new ethers.providers.CloudflareProvider()


// Contracts.
// 
const ENSRegistry = new ethers.Contract(
    '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
    [
        'function resolver(bytes32 node) external view returns (address)'
    ],
    provider
)

const ENSResolver = new ethers.Contract(
    ethers.constants.AddressZero,
    [
        'function contenthash(bytes32 node) external view returns (bytes memory)'
    ],
    provider
)

// Test the ENS integration.
async function testENS() {
    let resolver = await provider.getResolver('uniswap.eth')
    // ethers.js is broken for the uniswap.eth hash at this time. 
    // And the ensjs docs are out-of-sync. Goddamit.
    // let hash = await resolver.getContentHash()
    const hash = await resolver._fetchBytes("0xbc1c58d1");
    const content = contentHash.decode(hash)
    const codec = contentHash.getCodec(hash)

    // let resolver = ENSResolver.attach(resolverAddr)
    // let hash = await resolver.contenthash(namehash('uniswap.eth').substring(2))
    console.log(hash, content, codec)
}



class Cache {
    constructor(opts = {}) {
        this.cache = {}
        this.DEFAULT_EXPIRES = opts.expiry || 5000
    }

    put(k, v, expiry) {
        let expires = new Date + (expiry != null ? expiry : this.DEFAULT_EXPIRES)
        this.cache[k] = {
            expires,
            value: v
        }
    }

    get(k) {
        let entry = this.cache[k]
        if(!entry) return null

        let now = +new Date
        if(now < entry.expires) {
            return entry.value
        } else {
            delete this.cache[k]
            return null
        }
    }
}

let ensCache = new Cache({
    expiry: 15000 // 3s expiry
})

async function resolveENS(name) {
    let cached = ensCache.get(name)
    if(cached) return cached

    console.time('provider.getResolver')
    const resolver = await provider.getResolver(name)
    if (!resolver) {
        throw new Error(`ENS name doesn't exist: ${name}`)
    }
    console.timeEnd('provider.getResolver')

    console.time('resolver._fetchBytes')
    // let hash = await resolver.getContentHash()
    const hashHex = await resolver._fetchBytes("0xbc1c58d1");
    console.timeEnd('resolver._fetchBytes')
    if (hashHex == '0x') return {
        codec: null,
        hash: null
    }

    // const uint8 = Uint8Array.from(Buffer.from(hashHex.slice(2), 'hex'));
    // console.log(uint8)
    // const multihash = Multihash.decode(uint8)
    // console.log(multihash)
    // return
    const hash = contentHash.decode(hashHex)
    const codec = contentHash.getCodec(hashHex)
    let dnsLinkName

    if(codec == 'ipns-ns') {
        // FIX for https://github.com/ensdomains/ens-app/issues/849#issuecomment-660179328
        // > i believe that specifying 0xe5 for IPNS, 0x01 for the CID version (i'm confused by the second instance of 0x01 which appears after the first in all the 1577 examples, but ignoring that for now), 0x70 for dag-pb (not 100% sure what this does), and 0x00 as the identity transformation, followed by the length of the IPNS identifier and (in the case of DNSLink) the identifier itself in utf-8 is enough to satisfy the requirements
        // > the 0x00 identity transformation (as compared to e.g. 0x12 for sha2-256) is meant to be the hint!
        // > for example, using multihashes, multihashes.encode(Buffer.from('noahzinsmeister.com'), 'identity') produces the multihash of < Buffer 00 13 6e 6f 61 68 7a 69 6e 73 6d 65 69 73 74 65 72 2e 63 6f 6d > i.e. 00136e6f61687a696e736d6569737465722e636f6d.converting to CIDv1 via cids, new CID(1, 'dag-pb', multihashes.encode(Buffer.from('noahzinsmeister.com'), 'identity')) yields a CID whose prefix is < Buffer 01 70 00 13 > i.e. 01700013.so, if you see the 0x00 as the multihash function code, the content is utf - 8.
        //
        // ...
        //
        // I'm gonna kill someone.
        // Everyone except this guy - https://github.com/ensdomains/ens-app/issues/849#issuecomment-777088950.
        // See https://github.com/ensdomains/ui/blob/3790d35dcfa010897eae9707f2b383d2b983525e/src/utils/contents.js#L6 for more code to help parse this.
        // 
        // If the codec is ipfs-ns, then the hash could be....yet another hash.
        let hashDecoded = bs58.decode(hash)
        let hashBuffer = Buffer.from(hashDecoded)
        
        const IDENTITY_FN = 0x00
        if (hashBuffer[0] == IDENTITY_FN) {
            dnsLinkName = hashBuffer.slice(2).toString()
        }
    }

    let value = {
        codec,
        hash,
        dnsLinkName
    }

    ensCache.put(name, value)

    return value
}


const dnsLinkJS = require('@dnslink/js')
const { wellknown } = require('dns-query')

let _dnsEndpoints = null
async function getDNSEndpoints() {
    if (_dnsEndpoints) {
        return _dnsEndpoints
    }

    // A set of well-known DNS-over-HTTPS (DoH) endpoints.
    _dnsEndpoints = await wellknown.endpoints('doh')
    return _dnsEndpoints
}

const dnsLinkCache = new Cache()

async function resolveDNSLink(name) {
    // Check cache.
    let cached = dnsLinkCache.get(name)
    if (cached) return cached

    // Resolve via DNSLink.
    const dnsLinkRes = await dnsLinkJS.resolve(name, {
        endpoints: await getDNSEndpoints()
    })

    if (!dnsLinkRes.links.ipfs) {
        throw new Error("No supported DNSLink links for domain:", name, JSON.stringify(dnsLinkRes.links, null, 2))
    }

    const link = dnsLinkRes.links.ipfs[0]
    
    // Insert into cache.
    dnsLinkCache.put(name, link.identifier, link.ttl * 1000)

    // Return the identifier (CID).
    return link.identifier
}

module.exports = {
    testENS,
    resolveENS,
    getDNSEndpoints,
    resolveDNSLink
}

