const contentHash = require('content-hash')
// const Multihash = require('@liamzebedee/multihashes')

const { namehash } = require("@ethersproject/hash")
const ethers = require('ethers')
const bs58 = require('bs58')
const fetch = require('node-fetch')
// const request = require('request');
const http = require('node:http');

const telemetry = require('./telemetry')
const { PerfTimer, now } = require('./utils')

const {
    IPFSTimeoutError,
    IPNSTimeoutError
} = require('./errors')

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

// https://github.com/mds1/multicall
const ETHEREUM_MULTICALL_ADDRESS = `0xcA11bde05977b3631167028862bE2a173976CA11`
const Multicall = new ethers.Contract(
    ETHEREUM_MULTICALL_ADDRESS,
    [
        // https://github.com/mds1/multicall
        'function aggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes[] returnData)',
        'function aggregate3(tuple(address target, bool allowFailure, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
        'function aggregate3Value(tuple(address target, bool allowFailure, uint256 value, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
        'function blockAndAggregate(tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
        'function getBasefee() view returns (uint256 basefee)',
        'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
        'function getBlockNumber() view returns (uint256 blockNumber)',
        'function getChainId() view returns (uint256 chainid)',
        'function getCurrentBlockCoinbase() view returns (address coinbase)',
        'function getCurrentBlockDifficulty() view returns (uint256 difficulty)',
        'function getCurrentBlockGasLimit() view returns (uint256 gaslimit)',
        'function getCurrentBlockTimestamp() view returns (uint256 timestamp)',
        'function getEthBalance(address addr) view returns (uint256 balance)',
        'function getLastBlockHash() view returns (bytes32 blockHash)',
        'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (tuple(bool success, bytes returnData)[] returnData)',
        'function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) payable returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
    ],
    provider
)

// The Public Resolver.
const DEFAULT_ENS_RESOLVER = `0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41`

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
    // console.log(hash, content, codec)
}

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


const {
    performance,
    PerformanceObserver,
} = require('node:perf_hooks');




// Promise memoization.
// 
let _promiseMutex = {}

const resolveENS = async (name) => {
    let key = `resolveENS-${name}`
    if (_promiseMutex[key]) return _promiseMutex[key]
    _promiseMutex[key] = _resolveENS(name)
    return _promiseMutex[key]
}

const resolveIPNS = async (ipfsNodeApiUrl, ipnsPath) => {
    let key = `resolveIPNS-${ipnsPath}`
    if (_promiseMutex[key]) return _promiseMutex[key]
    _promiseMutex[key] = _resolveIPNS(ipfsNodeApiUrl, ipnsPath)
    return _promiseMutex[key]
}



// Resolves ENS domains to content hashes.
// Does this optimistically - if the resolver is the default resolver, we can
// resolve the content hash without making any additional calls.
async function _resolveENS(name) {
    // 1) Fast-path: resolve to cache.
    let cached = ensCache.get(name)
    if(cached) {
        // telemetry.log('local-gateway', 'resolve-ens', {
        //     rpcNode: provider.connection.url,
        //     ensName: name,
        //     timeToResolve: 0,
        // })
        return cached
    }

    // 
    // 2) Slow-path: resolve to ENS.
    // 
    // This involves two steps:
    // 1. Resolve the ENS name to its ENS resolver.
    // 2. Call the resolver to get the content hash.
    // 
    // Ordinarily, this would require two separate calls to the ENS registry.
    // However, most ENS names use the default resolver.
    // We use multicall here to make a single call to the ENS registry, which
    // will optimistically resolve the content hash if the resolver is the
    // default resolver.
    // 
    let timer_ens = new PerfTimer(`ens.getResolver(${name})`)
    let timer_ens_resolver = new PerfTimer(`resolver.getContentHash(${name})`)

    const namehash = ethers.utils.namehash(name)

    const calls = [
        [DEFAULT_ENS_RESOLVER, ENSResolver.interface.encodeFunctionData("contenthash", [namehash])],
        [ENSRegistry.address, ENSRegistry.interface.encodeFunctionData("resolver", [namehash])]
    ]

    const [_, results] = await Multicall.callStatic.aggregate(calls)

    const [defaultResolverContentHash$, resolverAddr$] = results

    // Now decode the return data.
    const defaultResolverContentHash = ENSResolver.interface.decodeFunctionResult("contenthash", defaultResolverContentHash$)[0]
    const resolverAddr = ENSRegistry.interface.decodeFunctionResult("resolver", resolverAddr$)[0]

    let contentHashHex = defaultResolverContentHash
    if(resolverAddr != DEFAULT_ENS_RESOLVER) {
        // Lookup content hash from custom resolver.
        const resolver = await provider.getResolver(name)
        timer_ens.end()

        if (!resolver) {
            timer_ens_resolver.end()
            throw new Error(`ENS name doesn't exist: ${name}`)
        } else {
            // let hash = await resolver.getContentHash()
            contentHashHex = await resolver._fetchBytes("0xbc1c58d1");
            timer_ens_resolver.end()
        }
        
    } else {
        timer_ens.end()
        timer_ens_resolver.end()
    }
    
    telemetry.log('local-gateway', 'resolve-ens', {
        rpcNode: provider.connection.url,
        ensName: name,
        timeToResolve: timer_ens.elapsed,
    })

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
    // const contentHashBuf = Buffer.from(contentHashHex.slice(2), 'hex')

    // // FIX for https://github.com/ensdomains/ens-app/issues/849#issuecomment-660179328
    // const isSpecialCaseRawDnsLink = 
    //     contentHashBuf[0] == NAMESPACE_IPNS
    //     && contentHashBuf[3] == CONTENT_TYPE_DAG_PB
    //     && contentHashBuf[4] == IDENTITY_FN

    // if (isSpecialCaseRawDnsLink) {
    //     // > i believe that specifying 0xe5 for IPNS, 0x01 for the CID version (i'm confused by the second instance of 0x01 which appears after the first in all the 1577 examples, but ignoring that for now), 0x70 for dag-pb (not 100% sure what this does), and 0x00 as the identity transformation, followed by the length of the IPNS identifier and (in the case of DNSLink) the identifier itself in utf-8 is enough to satisfy the requirements
    //     // > the 0x00 identity transformation (as compared to e.g. 0x12 for sha2-256) is meant to be the hint!
    //     // > for example, using multihashes, multihashes.encode(Buffer.from('noahzinsmeister.com'), 'identity') produces the multihash of < Buffer 00 13 6e 6f 61 68 7a 69 6e 73 6d 65 69 73 74 65 72 2e 63 6f 6d > i.e. 00136e6f61687a696e736d6569737465722e636f6d.converting to CIDv1 via cids, new CID(1, 'dag-pb', multihashes.encode(Buffer.from('noahzinsmeister.com'), 'identity')) yields a CID whose prefix is < Buffer 01 70 00 13 > i.e. 01700013.so, if you see the 0x00 as the multihash function code, the content is utf - 8.
    //     //
    //     // ...
    //     //
    //     // I'm gonna kill someone.
    //     // Everyone except this guy - https://github.com/ensdomains/ens-app/issues/849#issuecomment-777088950.
    //     // See https://github.com/ensdomains/ui/blob/3790d35dcfa010897eae9707f2b383d2b983525e/src/utils/contents.js#L6 for more code to help parse this.
    //     // 
    //     // If the codec is ipfs-ns, then the hash could be....yet another hash.
    //     let hashDecoded = bs58.decode(hash)
    //     let hashBuffer = Buffer.from(hashDecoded)
    //     dnsLinkName = hashBuffer.slice(2).toString()
    //     console.log(`dnsLink ${dnsLinkName}`)
    // }

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

const resolveIpnsLink = async ({ ipfsNodeApiUrl, path }) => {
    const baseUrl = `${ipfsNodeApiUrl}/api/v0/resolve`
    const params = new URLSearchParams({
        arg: path,
        recursive: true
    })
    const url = baseUrl + '?' + params.toString()
    // console.debug(url)
    
    // TODO: rewrite using `http` so it uses http.Agent and connection keepalive/pooling.
    const res = await fetch(url, {
        method: 'POST',
    })
    const data = await res.json()

    if (res.status != 200) {
        console.debug(data)

        if (data.Message.includes("no link named")) {
            console.debug("No link under IPNS path.")
            return null
        } else {
            throw new Error("Error resolving IPNS path: " + JSON.stringify(data))
        }
    }

    return data.Path
}

const IPNS_RESOLVER_TIMEOUT = 1000 * 15

async function _resolveIPNS(ipfsNodeApiUrl, ipnsPath) {
    // Check cache.
    let cached = ipnsCache.get(ipnsPath)
    if (cached) {
        // telemetry.log('local-gateway', 'resolve-ipns', {
        //     ipnsNode: ipfsNodeApiUrl,
        //     path: ipnsPath,
        //     timeToResolve: 0,
        // })
        return cached
    }

    try {
        const timer_ipns = new PerfTimer(`resolveIPNSLink(${ipnsPath})`)

        // Resolve with timeout.
        // const ipfsPathRoot = await Promise.race([
        //     resolveIpnsLink({ ipfsNodeApiUrl, path: ipnsPath })
            
        //     // ,new Promise((resolve, reject) => {
        //     //     setTimeout(() => {
        //     //         reject(new IPNSTimeoutError("Timed out resolving IPNS path."))
        //     //     }, IPNS_RESOLVER_TIMEOUT)
        //     // })
        // ])
        const ipfsPathRoot = await resolveIpnsLink({ ipfsNodeApiUrl, path: ipnsPath })

        timer_ipns.end()

        // telemetry.log('local-gateway', 'resolve-ipns', {
        //     ipnsNode: ipfsNodeApiUrl,
        //     path: ipnsPath,
        //     timeToResolve: timer_ipns.elapsed,
        //     timeout: false
        // })

        if(!ipfsPathRoot) {
            return null
        }

        // NOTE: data.Path does not return the path with a trailing slash "/",
        // although if we pass this to the IPFS Gateway, it will return us a page which says
        // "Moved Permanently.". Hence we add the slash here.
        const value = ipfsPathRoot + '/'

        // Insert into cache.
        ipnsCache.put(ipnsPath, value)

        // Return the IPFS root path (/ipfs/{cid}/).
        return value
    } catch(err) {
        console.error(err)

        if(err instanceof IPNSTimeoutError) {
            // telemetry.log('local-gateway', 'resolve-ipns', {
            //     ipnsNode: ipfsNodeApiUrl,
            //     path: ipnsPath,
            //     timeToResolve: IPNS_RESOLVER_TIMEOUT,
            //     timeout: true
            // })
        }

        throw err
    }
}

module.exports = {
    testENS,
    resolveENS,
    getDNSEndpoints,
    resolveDNSLink,
    resolveIPNS
}

