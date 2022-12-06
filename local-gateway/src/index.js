const fs = require('fs')
const http = require('http');
const https = require('https');
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


function timeoutAfter(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error("request timed-out"));
        }, seconds * 1000);
    });
}

// Autogenerate a certificate for any .eth domain, as a part of the Server Name Identification (SNI) callback in the TLS protocol.
const sniCallback = (serverName, callback) => {
    // console.log('sni', serverName)
    var tld = serverName.slice(-3);
    if (tld != 'eth') {
        return;
    }

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

class ENSNoContentError extends Error { }
class UnsupportedContentTypeError extends Error { }

function start(opts = {
    ipfsNodeUrl: null,
    ipfsNode: null
}) {
    const app = express();
    
    // Preload DNS endpoints.
    getDNSEndpoints()
    testENS()

    // let ipfsGateways = [
    //     // 'https://cloudflare-ipfs.com',
    //     'https://ipfs.fleek.co',
    //     'https://ipfs.io'
    //     // 'https://ipfs.eth.limo'
    // ]
    //
    // if (opts.ipfsNodeUrl) {
    //     ipfsGateways = [opts.ipfsNodeUrl, ...ipfsGateways]
    // }
    // 
    // let ensGateways = [
    //     (name) => `https://${name}.eth.limo`
    // ]

    const getIpfsGateway = () => {
        // NOTE: If the host below is specified as localhost, the ipfs-node software will
        // perform a 301 redirect to baf_ENCODED_HASH.ipfs.localhost. We don't want this,
        // since node-fetch can't handle it.
        return 'http://127.0.0.1:8080'
    }

    // The local gateway receives requests on /*.
    // For example, a request to uniswap.eth/favicon.ico.
    // This is transmitted as a HTTP request in the form:
    // ```
    // GET /favicon.ico
    // Host: uniswap.eth
    // ```
    app.get('/*', async (req, res, next) => {
        res.setHeader('X-Dappnet-Gateway', require('../package.json').version);

        const host = req.hostname
        if (!host || !host.length) return

        // For testing purposes.
        if (host == 'localhost') {
            res.write("localhost says hello!")
            res.end()
            return
        }

        // Resolve ENS to content hash.
        req.ensName = host
        const ensName = host
        try {
            console.time(req.path)
            req.ensData = await resolveENS(ensName);
            console.timeEnd(req.path)
        } catch(err) {
            return next(err)
        }

        const { codec, hash, dnsLinkName } = req.ensData
        console.log('resolveENS', ensName, codec, hash, dnsLinkName)

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
        }
    });

    async function getIpfs(req, res, next) {
        const cid = req.ensData.hash

        // if (opts.ipfsNode) {
        //     const ipfsPath = `/ipfs/${cid}${req.path || '/'}`
            
        //     console.log(req.hostname, `getIpfs`, `local-ipfs`, ipfsPath)

        //     const asyncIterable = opts.ipfsNode.cat(ipfsPath)
            
        //     try {
        //         await streamPipeline(asyncIterable, res);
        //     } catch(err) {
        //         next(err)
        //         return
        //     }

        //     res.header = gatewayRes.headers.raw()
        //     res.end()
        //     return
        // }

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

        // Resolve the IPNS CID.
        const { dnsLinkName } = req.ensData
        if (dnsLinkName) {
            console.time(`resolveDNSLink(${dnsLinkName})`)
            cid = await resolveDNSLink(dnsLinkName)
            console.timeEnd(`resolveDNSLink(${dnsLinkName})`)
            ipfsPath = `/ipfs/${cid}${req.path || '/'}`

            // TODO: DNSLink resolution assumes only IPFS content here.
            res.setHeader('X-Dappnet-IPFS', `${cid}`);
            
            req.ipnsData = {
                ipfsPath
            }
        } else {
            const pubkeyHash = req.ensData.hash
            const ipnsPath = `/ipns/${pubkeyHash}${req.path || '/'}`
            ipfsPath = await resolveIPNS(opts.ipfsNode, ipnsPath)

            res.setHeader('X-Dappnet-IPNS', `${ipnsPath}`);
            // TODO: ugly temp hack.
            
            const cid = (new URL("http://example-ipfs-path-only-for-testing.com" + ipfsPath)).pathname.split('/')[2] // part after /ipfs/
            res.setHeader('X-Dappnet-IPFS', `${cid}`);

            req.ipnsData = {
                ipfsPath
            }
        }

        try {
            await proxyToGateway(req, ipfsPath, res)
            return
        } catch (err) {
            return next(err)
        }
    }

    const proxyToGateway = async (req, ipfsPath, res) => {
        const gatewayRewrite = `${getIpfsGateway()}${ipfsPath}`

        console.log(req.hostname, gatewayRewrite)
        let gatewayRes = await fetch(
            gatewayRewrite,
            { highWaterMark: 5 * 1024 * 1024 }
        )

        // TODO: make this smart later.
        const headers = `Accept-Ranges Content-Length Content-Type X-Ipfs-Path X-Ipfs-Roots Date`.split(' ')
        const gatewayHeaders = gatewayRes.headers.raw()
        // console.log(gatewayRes.headers)

        headers.map(name => {
            const lowercaseName = name.toLowerCase()
            if (!gatewayHeaders[lowercaseName]) return
            // TODO these are all lowercase.
            const val = gatewayHeaders[lowercaseName][0]
            res.setHeader(name, val)
        })

        await streamPipeline(gatewayRes.body, res);
        // res.send(gatewayRes.body)

        res.end()
    }

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

    const httpsServer = require('https').Server({
        key: fs.readFileSync(__dirname + '/../certs/kwenta.eth.key', 'utf8'),
        cert: fs.readFileSync(__dirname + '/../certs/kwenta.eth.crt', 'utf8'),
        SNICallback: sniCallback,
    }, app);

    httpsServer.listen(PROXY_PORT_HTTPS, async () => {
        console.log(`Proxy server listening on https://localhost:${PROXY_PORT_HTTPS}`)

        // await preload('app.ens.eth')
        // await preload('uniswap.eth')
        // await preload('tornadocash.eth')
        // await preload('vitalik.eth')
        // await preload('rollerskating.eth')
        // await preload('liamz.eth')
    })

    // HTTP.
    const httpServer = http.createServer(app);
    httpServer.listen(PROXY_PORT_HTTP, () => {
        console.log(`Proxy server listening on http://localhost:${PROXY_PORT_HTTP}`)
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
            <p>If you're the owner of this name, you can <a href="https://app.ens.eth/#/name/${ensName}/details">configure it here</a> on ENS.
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
