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


const now = () => (+new Date)
class Cache {
    constructor(opts = {}) {
        this.cache = {}
        this.DEFAULT_EXPIRES = opts.expiry || 5000
    }

    put(k, v, expiry) {
        let expires = now() + (expiry != null ? expiry : this.DEFAULT_EXPIRES)
        this.cache[k] = {
            expires,
            value: v
        }
    }

    get(k) {
        let entry = this.cache[k]
        if(!entry) return null

        if (now() < entry.expires) {
            return entry.value
        } else {
            delete this.cache[k]
            return null
        }
    }
}

let ensCache = new Cache({
    expiry: 1000 * 60 * 60 // 1hr
})


// Multihash constants.
const NAMESPACE_IPNS = 0xe5
const CONTENT_TYPE_DAG_PB = 0x70
const IDENTITY_FN = 0x00

async function resolveENS(name) {
    let cached = ensCache.get(name)
    if(cached) return cached

    console.time(`provider.getResolver(${name})`)
    const resolver = await provider.getResolver(name)
    if (!resolver) {
        throw new Error(`ENS name doesn't exist: ${name}`)
    }
    console.timeEnd(`provider.getResolver(${name})`)

    console.time(`resolver._fetchBytes(${name})`)
    // let hash = await resolver.getContentHash()
    const contentHashHex = await resolver._fetchBytes("0xbc1c58d1");
    console.log(contentHashHex)
    console.timeEnd(`resolver._fetchBytes(${name})`)
    if (contentHashHex == '0x') return {
        codec: null,
        hash: null
    }

    // const uint8 = Uint8Array.from(Buffer.from(hashHex.slice(2), 'hex'));
    // console.log(uint8)
    // const multihash = Multihash.decode(uint8)
    // console.log(multihash)
    // return
    const hash = contentHash.decode(contentHashHex)
    const codec = contentHash.getCodec(contentHashHex)
    let dnsLinkName

    // 1. ipns cidv1 libp2p-key identity hash
    // 2. ipns cidv1 dab-pb sha2-256 hash
    // 3. ipns cidv1 dag-pb identity dnslink_domain
    // #3 is uniswap.eth, and the special case which the NPM libraries don't accomodate for.
    // cidv1 : <multibase-prefix><multicodec-cidv1><multicodec-content-type><multihash-content-address>

    // It's probably sufficient to differentiate this based on dag-pb + identity.
    /*
    pos | code | descriptor        | variable
    --------------------------------------------------------
    0x00 e5      ipns                codec
    0x01 01      cidv1               codec2 
    0x02 01      [length]
    0x03 70      dag-pb              codec3 / contenttype
    0x04 00      identity function   hash fn
    0x05 0f      [length]
    */
    const contentHashBuf = Buffer.from(contentHashHex.slice(2), 'hex')

    // FIX for https://github.com/ensdomains/ens-app/issues/849#issuecomment-660179328
    const isSpecialCaseRawDnsLink = 
        contentHashBuf[0] == NAMESPACE_IPNS
        && contentHashBuf[3] == CONTENT_TYPE_DAG_PB
        && contentHashBuf[4] == IDENTITY_FN

    if (isSpecialCaseRawDnsLink) {
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
        dnsLinkName = hashBuffer.slice(2).toString()
        console.log(`dnsLink ${dnsLinkName}`)
    }

    let value = {
        codec,
        contentHashHex,
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


const ipnsCache = new Cache({
    expiry: 1000 * 60 * 60 // 1hr
})

async function resolveIPNS(ipfsHttpClient, ipnsPath) {
    // Check cache.
    let cached = ipnsCache.get(ipnsPath)
    if (cached) return cached

    const ipfsPathRoot = await ipfsHttpClient.resolve(ipnsPath, { recursive: false })
    console.log(ipfsPathRoot)
    const value = ipfsPathRoot

    // Insert into cache.
    ipnsCache.put(ipnsPath, value)

    // Return the IPFS root path (/ipfs/{cid}/).
    return value
}

module.exports = {
    testENS,
    resolveENS,
    getDNSEndpoints,
    resolveDNSLink,
    resolveIPNS
}

