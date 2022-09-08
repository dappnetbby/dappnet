const contentHash = require('content-hash')
const { namehash } = require("@ethersproject/hash")
const ethers = require('ethers')

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



class ENSCache {
    constructor() {
        this.cache = {}
        this.EXPIRY_TIME = 15000 // 3s expiry
    }

    put(k, v) {
        this.cache[k] = {
            expires: (+new Date) + this.EXPIRY_TIME,
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

let ensCache = new ENSCache()

async function resolveENS(name) {
    let cached = ensCache.get(name)
    if(cached) return cached

    const resolver = await provider.getResolver(name)
    if (!resolver) {
        throw new Error("no ENS name")
    }
    // let hash = await resolver.getContentHash()
    const hashHex = await resolver._fetchBytes("0xbc1c58d1");
    if (hashHex == '0x') return {
        codec: null,
        hash: null
    }

    const hash = contentHash.decode(hashHex)
    const codec = contentHash.getCodec(hashHex)

    let value = {
        codec,
        hash
    }

    ensCache.put(name, value)

    return value
}

module.exports = {
    testENS,
    resolveENS
}

