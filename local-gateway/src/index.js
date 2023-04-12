const fs = require('fs')
const http = require('node:http');
const https = require('node:https');
const express = require('express');
const fetch = require('node-fetch')
const shell = require('shelljs');
const tls = require('tls');
const { execSync } = require('child_process');
const { createWriteStream } = require('node:fs')
const { pipeline } = require('node:stream')
const { promisify } = require('node:util')
const streamPipeline = promisify(pipeline);
const { CID } = require('multiformats/cid')
const chalk = require('chalk');

const Socks5Proxy = require('./socks5-proxy/proxy')
const telemetry = require('./telemetry')

const { PerfTimer } = require('./utils')

const {
    testENS,
    resolveENS,
    getDNSEndpoints,
    resolveDNSLink,
    resolveIPNS
} = require('./ens')

const { 
    loadCertificateAuthorityData,
    generateCertificate,
    generateCertificateOpenSSL
} = require('./certificates');

const {
    ENSNoContentError,
    UnsupportedContentTypeError,
    IPFSTimeoutError,

    noContentForENSNamePage,
    unsupportedContentPage,
    defaultErrorPage,
} = require('./errors')

const {
    PROXY_PORT_HTTP,
    PROXY_PORT_HTTPS,
    IPFS_NODE_API_URL,
    IPFS_HTTP_GATEWAY
} = require('./config')

// Logging.
class Logger {
    constructor() {}

    info() {
        const time = new Date().toISOString()
        console.log(chalk.gray(`[${time}]`) + ' ' + chalk.white(...arguments))
    }

    debug() {
        const time = new Date().toISOString()
        console.log(chalk.gray(`[${time}]`) + ' ' + chalk.gray(...arguments))
    }

    error() {
        console.log(chalk.gray(`[${time}]`) + ' ' + chalk.red(...arguments))
    }
}

const log = new Logger()


function timeoutAfter(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error("request timed-out"));
        }, seconds * 1000);
    });
}

// Autogenerate a certificate for any .eth domain, as a part of the Server Name Identification (SNI) callback in the TLS protocol.
const sniCallback = (serverName, callback) => {
    var tld = serverName.slice(-3);
    // if (tld != 'eth') {
    //     return;
    // }

    try {
        // const { key, cert } = generateCertificateOpenSSL(serverName)
        const { key, cert } = generateCertificate(serverName)
        // fs.writeFileSync(__dirname + `/../dev-certificates/certs/test.${serverName}.crt`, cert, 'utf8')

        const ctx = new tls.createSecureContext({
            key,
            cert,
        })

        callback(null, ctx);
    } catch (err) {
        console.error(err)
        callback(new Error("couldn't dynamically create cert for domain - " + serverName))
    }
}


// 
// Middleware for resolving/loading IPFS/IPNS content.
// 

async function getIpfs(req, res, next) {
    const cid = req.ensData.hash

    const ipfsPath = `/ipfs/${cid}${req.path || '/'}`
    res.setHeader('X-Dappnet-IPFS', `${cid}`);

    try {
        await resolveIpfs(req, ipfsPath, res)
        return
    } catch (err) {
        return next(err)
    }
}


async function getIpns(req, res, next) {
    let ipfsPath

    // 1) Resolve the IPNS CID.
    const { dnsLinkName } = req.ensData

    // 1a) DNSLink.
    // NOTE: this will be deprecated. Because it's stupid.
    // Only left it here because I wanted to support Uniswap.
    if (dnsLinkName) {
        // Resolve the DNS link.
        const timer_dnslink = new PerfTimer(`resolveDNSLink(${dnsLinkName})`)
        cid = await resolveDNSLink(dnsLinkName)
        timer_dnslink.end(`resolveDNSLink(${dnsLinkName})`)

        // Construct the IPFS path.
        ipfsPath = `/ipfs/${cid}${req.path || '/'}`

        // TODO: DNSLink resolution assumes only IPFS content here.
        res.setHeader('X-Dappnet-IPFS', `${cid}`);

        req.ipnsData = {
            ipfsPath
        }
    } else {
        // 1b) IPNS.
        // Resolve the IPNS path.
        // Construct an /ipns/ path and then forward it for resolution.
        const pubkeyHash = req.ensData.hash
        const ipnsPath = `/ipns/${pubkeyHash}${req.path || '/'}`

        ipfsPath = await resolveIPNS(IPFS_NODE_API_URL, ipnsPath)
        if (ipfsPath === null) {
            throw new Error("IPNS path not found:", ipnsPath)
        }

        res.setHeader('X-Dappnet-IPNS', `${ipnsPath}`);
        
        // Extract the CID from the IPFS path.
        const cid = (new URL("http://example-ipfs-path-only-for-testing.com" + ipfsPath)).pathname.split('/')[2] // part after /ipfs/
        res.setHeader('X-Dappnet-IPFS', `${cid}`);

        req.ipnsData = {
            ipnsPath,
            ipfsPath
        }

        // const gateway8080Path = `${ipnsPath}`
        // console.log(gateway8080Path)
        // try {
        //     await resolveIpfs(req, gateway8080Path, res)
        //     return
        // } catch (err) {
        //     return next(err)
        // }
    }

    // 2) Proxy the request for a CID to the gateway.
    try {
        await resolveIpfs(req, ipfsPath, res)
        return
    } catch (err) {
        return next(err)
    }
}

const mime = require('mime-types')
const { extname } = require('path')

const resolveIpfs = async (req, ipfsPath, res) => {
    const gatewayUrl = `${IPFS_HTTP_GATEWAY}${ipfsPath}`

    // Get the ENS domain.
    const domain = req.hostname
    log.info(chalk.yellow('resolveIpfs'), domain, gatewayUrl)

    const timer_ipfs = new PerfTimer(`resolveIpfs(${gatewayUrl})`)
    console.log(ipfsPath)
    
    // Perform MIME type sniffing.
    // NOTE: this is obviously ugly, and not robust.
    // It is to workaround the performance of the IPFS gateway.
    // There are two ways to resolve IPNS content from our local gateway:
    // 1. Use the IPNS endpoint - /ipns/12123213123/, which will allow us to lookup subpaths like /ipns/12123213123/styles.css, 
    //    and automatically perform the MIME sniffing for Content-Type.
    // 2. Use the IPFS endpoint - /ipfs/12312312312/.
    // The latency of (1) was unacceptable, and deserves further investigation. However since we're near launch, and this is an approximate solution,
    // this will do for now.
    const strippedPath = req.path.split('?')[0]
    const ext = extname(strippedPath)
    const contentType = mime.lookup(ext) || ''

    req.headers['host'] = ''
    const params = {
        hostname: '127.0.0.1',
        port: 8080,
        path: ipfsPath,
        headers: req.headers,
        method: 'GET'
    }

    http.get(params, async (gatewayRes) => {
        // Transfer the headers from the response.
        gatewayRes.headers['cache-control'] = 'max-age=300, must-revalidate'
        gatewayRes.headers['content-type'] = contentType
        res.writeHead(gatewayRes.statusCode, gatewayRes.headers);

        // Stream the response.
        gatewayRes.pipe(res)
        
        // Detect when the response is complete.
        gatewayRes.on('end', () => {
            timer_ipfs.end()

            // Check for errors.
            // if (gatewayRes.statusCode !== 200) {
            //     // throw new Error(`IPFS gateway returned status code ${gatewayRes.statusCode}`)
            //     return
            // }

            // telemetry.log('local-gateway', 'resolve-ipfs', {
            //     ensName: domain,
            //     ipnsNode: IPFS_HTTP_GATEWAY,
            //     path: ipfsPath,
            //     timeToResolve: timer_ipfs.elapsed,
            // })
        })
    })
}



const gatewayAgent = new http.Agent({
    keepAlive: true,
    maxSockets: 1000,
});

http.globalAgent = gatewayAgent

function start({ dappnetCADataPath, telemetryConfig }) {
    const app = express();
    
    telemetry.configure(telemetryConfig)
    loadCertificateAuthorityData(dappnetCADataPath)

    // Preload DNS endpoints.
    getDNSEndpoints()
    // testENS()

    // The local gateway receives requests on /*.
    // For example, a request to uniswap.eth/favicon.ico.
    // This is transmitted as a HTTP request in the form:
    // ```
    // GET /favicon.ico
    // Host: uniswap.eth
    // ```
    app.get('/*', async (req, res, next) => {
        const fullPath = `${req.hostname}${req.path || '/'}`
        const timer_gatewayResolve = new PerfTimer(`gatewayResolve("${fullPath}")`)
        log.info(chalk.yellow('GET'), fullPath)

        res.setHeader('X-Dappnet-Gateway', require('../package.json').version);

        const host = req.hostname
        if (!host || !host.length) return

        // For testing purposes.
        if (host == 'localhost') {
            res.write("localhost says hello!")
            res.end()
            return
        }

        if(host == 'ipfs.dappnet') {
            // Utility to resolve IPFS: ipfs.dappnet/?hash=Qm...

            // Match Qm up until the first /
            console.log(req.params)
            const hash = req.query.hash
            if(!hash) {
                res.write("Invalid IPFS hash")
                res.end()
                return
            }

            console.log(hash)
            try {
                const v0 = CID.parse(hash)
                
                // v0.toString()
                //> 'QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n'
                if(v0 == null) throw new Error("Invalid CID: " + hash)
                
                //> 'bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku'
                const cidv1 = v0.toV1().toString()

                const redirect = `https://${cidv1}.ipfs.dappnet`
                console.log(`redirect`, redirect)
                res.redirect(redirect)
                res.end()
                return
            } catch(err) {
                return next(err)
            }

        } else if(host.endsWith('.ipfs.dappnet')) {
            // Subdomain: QmHASH.ipfs.dappnet
            const cid = host.split('.')[0]
            req.ensData = { hash: cid, codec: "ipfs-ns" }

            const ipfsPath = `/ipfs/${cid}${req.path || '/'}`

            try {
                await resolveIpfs(req, ipfsPath, res)
                return
            } catch (err) {
                return next(err)
            }
        }

        // 1) Resolve ENS to content hash.
        const ensName = host
        req.ensName = ensName
        try {
            req.ensData = await resolveENS(ensName);
        } catch(err) {
            return next(err)
        }

        const { codec, hash, dnsLinkName } = req.ensData
        log.info(chalk.yellow('resolveENS'), ensName, `/${codec}/${hash}/`)

        // 2) Resolve content hash to content.
        let handler = {
            'ipfs-ns': getIpfs,
            'ipns-ns': getIpns,
        }

        if (!hash) {
            return next(new ENSNoContentError(`No content for ENS name "${ensName}", hash was ${hash}`))
        }

        if (!handler[codec]) {
            return next(new UnsupportedContentTypeError(`Dappnet cannot resolve ENS content type - multihash codec "${codec}"`))
        }

        try {
            await handler[codec](req, res, next)
        } catch(err) {
            next(err)
        } finally {
            timer_gatewayResolve.end(fullPath)
        }
    });
    

    function errorHandler(err, req, res, next) {
        if (res.headersSent) {
            return next(err)
        }
        res.status(500)
        res.render('error', { error: err })
    }

    app.use((err, req, res, next) => {
        console.error(err.stack)
        const { ensName } = req
        
        if (err instanceof ENSNoContentError) {
            errorPage = noContentForENSNamePage
        } else if (err instanceof UnsupportedContentTypeError) {
            errorPage = unsupportedContentPage
        } else {
            errorPage = defaultErrorPage
        }

        res.status(500).send(errorPage({ err, req, ensName }))
    })

    const httpsServer = https.Server({
        // key/cert unused here. This is just so we ca instantiate the server.
        // They are later dynamically generated using the SNICallback.
        key: fs.readFileSync(__dirname + '/../certs/kwenta.eth.key', 'utf8'),
        cert: fs.readFileSync(__dirname + '/../certs/kwenta.eth.crt', 'utf8'),
        SNICallback: sniCallback,
    }, app);

    // HTTPS server.
    httpsServer.listen(PROXY_PORT_HTTPS, async () => {
        log.info(`Gateway proxy server listening on https://localhost:${PROXY_PORT_HTTPS}`)
    })

    // HTTP server.
    const httpServer = http.createServer(app);
    httpServer.listen(PROXY_PORT_HTTP, () => {
        log.info(`Gateway proxy server listening on http://localhost:${PROXY_PORT_HTTP}`)
    })

    // Local SOCKS5 proxy.
    // Socks5Proxy.start()

    // API server.
    // NOTE: Experimental. This is used to display metadata in the extension.
    const apiServer = express();
    apiServer.get('/v0/url-info', async (req, res) => {
        const url = req.params['url']
        console.log(`url-info`, `url`, url)

        // Lookup from cache.
        // const res = fetch(`http://127.0.0.1:10422/${url.pathname}`, {
        //     headers: {
        //         'Host': url.hostname
        //     }
        // })
        // Return IPFS headers.
    })
}

function preload(ensName) {
    fetch(`http://127.0.0.1:10422/`, {
        headers: {
            'Host': ensName
        }
    })
    .catch(err => {
        console.debug('fetch', err)
    })
}


module.exports = {
    start
};
