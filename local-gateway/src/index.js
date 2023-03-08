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


const {
    testENS,
    resolveENS,
    getDNSEndpoints,
    resolveDNSLink,
    resolveIPNS
} = require('./ens')

const { 
    generateCertificate,
    generateCertificateOpenSSL
} = require('./certificates');

const PROXY_PORT_HTTP = 10422
const PROXY_PORT_HTTPS = 10424
const IPFS_NODE_API_URL = `http://127.0.0.1:5001`

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
// Errors.
// 

class ENSNoContentError extends Error { }
class UnsupportedContentTypeError extends Error { }

// 
// Middleware for resolving/loading IPFS/IPNS content.
// 

async function getIpfs(req, res, next) {
    const cid = req.ensData.hash

    const ipfsPath = `/ipfs/${cid}${req.path || '/'}`
    res.setHeader('X-Dappnet-IPFS', `${cid}`);

    try {
        await proxyToGateway(req, ipfsPath, res)
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
        console.time(`resolveDNSLink(${dnsLinkName})`)
        cid = await resolveDNSLink(dnsLinkName)
        console.timeEnd(`resolveDNSLink(${dnsLinkName})`)

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
            ipfsPath
        }
    }

    // 2) Proxy the request for a CID to the gateway.
    try {
        await proxyToGateway(req, ipfsPath, res)
        return
    } catch (err) {
        return next(err)
    }
}

const getIpfsGateway = () => {
    // NOTE: If the host below is specified as localhost, the ipfs-node software will
    // perform a 301 redirect to baf_ENCODED_HASH.ipfs.localhost. We don't want this,
    // since node-fetch can't handle it.
    return 'http://127.0.0.1:8080'
}

const gatewayAgent = new http.Agent({
    keepAlive: true, 
    maxSockets: 1000,
});

http.globalAgent = gatewayAgent

const proxyToGateway = async (req, ipfsPath, res) => {
    const gatewayUrl = `${getIpfsGateway()}${ipfsPath}`

    // Get the ENS domain.
    const domain = req.hostname
    log.info(chalk.yellow('proxyToGateway'), req.hostname, gatewayUrl)

    http.get(gatewayUrl, async (gatewayRes) => {
        // Transfer the headers from the response.
        res.writeHead(gatewayRes.statusCode, gatewayRes.headers);

        // Stream the response.
        gatewayRes.pipe(res)
    })
}

function start() {
    const app = express();
    
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
        // TODO bugged
        const fullPath = `${req.hostname}${req.path || '/'}`
        console.time(fullPath)
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
            const cid = host.split('.')[0]
            req.ensData = { hash: cid, codec: "ipfs-ns" }

            const ipfsPath = `/ipfs/${cid}${req.path || '/'}`

            try {
                await proxyToGateway(req, ipfsPath, res)
                return
            } catch (err) {
                return next(err)
            }
        }

        // 1) Resolve ENS to content hash.
        const ensName = host
        req.ensName = ensName
        try {
            console.time(req.path)
            req.ensData = await resolveENS(ensName);
            console.timeEnd(req.path)
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
            console.timeEnd(fullPath)
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

    httpsServer.listen(PROXY_PORT_HTTPS, async () => {
        log.info(`Gateway proxy server listening on https://localhost:${PROXY_PORT_HTTPS}`)
    })

    // HTTP.
    const httpServer = http.createServer(app);
    httpServer.listen(PROXY_PORT_HTTP, () => {
        log.info(`Gateway proxy server listening on http://localhost:${PROXY_PORT_HTTP}`)
    })

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

// 
// Error pages.
// 


const pageStyles = `
html {
  box-sizing: border-box;
  font-size: 16px;
}

body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

#error {
    text-align: left;
    width: 800px;
    margin: 0 auto;
    padding-top: 2rem;
}

#error h2 {
    margin-bottom: 0;
}

p {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
`
const noContentForENSNamePage = ({ req, err, ensName }) => {
    return `
<!doctype html>
<html>
    <head>
        <title>${ensName}</title>
        <style>${pageStyles}</style>
    </head>
    <body>
        <div id="error">
            <small>Dappnet</small>
            <h2>There was no content found for ${ensName}</h2>
            <p>The content hash was empty.</p>
            <p>If you're the owner of this name, you can <a href="https://app.ens.domains/name/${ensName}">configure it here</a> on ENS.
        </div>
    </body>
</html>
`
}

const unsupportedContentPage = ({ req, err, ensName }) => {
    return `
<!doctype html>
<html>
    <head>
        <title>${ensName}</title>
        <style>${pageStyles}</style>
    </head>
    <body>
        <div id="error">
            <small>Dappnet</small>
            <h2>Couldn't load content for ${ensName}</h2>
            <p>This content type is not yet supported by Dappnet or couldn't be parsed.</p>
            <pre>${`${err.toString()}\nENS data:\n${JSON.stringify(req.ensData, null, 2)}\nIPNS data:\n${JSON.stringify(req.ipnsData, null, 2)}`}</pre>
        </div>
    </body>
</html>
`
}

const defaultErrorPage = ({ req, err, ensName }) => {
    return `
<!doctype html>
<html>
    <head>
        <title>${ensName}</title>
        <style>${pageStyles}</style>
    </head>
    <body>
        <div id="error">
            <small>Dappnet</small>
            <h2>There was an unexpected error while loading ${ensName}</h2>
            <pre>${`${err.toString()}\nENS data:\n${JSON.stringify(req.ensData, null, 2)}\nIPNS data:\n${JSON.stringify(req.ipnsData, null, 2)}`}</pre>
        </div>
    </body>
</html>
`
}

module.exports = {
    start
};
