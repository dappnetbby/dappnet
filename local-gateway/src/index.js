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
const { clearScreenDown } = require('readline');

const PROXY_PORT = 10422
const PROXY_PORT_HTTPS = 10423
const PROXY_PORT_HTTPS_INNER = 10424


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

function start(opts = {
    ipfsNodeUrl: null,
    ipfsNode: null
}) {
    testENS()
    const app = express();
    getDNSEndpoints()
    // resolveENS('uniswap.eth')

    let ipfsGateways = [
        // 'https://cloudflare-ipfs.com',
        'https://ipfs.fleek.co',
        'https://ipfs.io'
        // 'https://ipfs.eth.limo'
    ]

    const getIpfsGateway = () => {
        // NOTE: If the host below is specified as localhost, the ipfs-node software will
        // perform a 301 redirect to baf_ENCODED_HASH.ipfs.localhost. We don't want this,
        // since node-fetch can't handle it.
        return 'http://127.0.0.1:8080'
    }

    let ensGateways = [
        (name) => `https://${name}.eth.limo`
    ]

    if (opts.ipfsNodeUrl) {
        ipfsGateways = [opts.ipfsNodeUrl, ...ipfsGateways]
    }

    // The local gateway receives requests on /*.
    // For example, a request to uniswap.eth/favicon.ico.
    // This is transmitted as a HTTP request in the form:
    // ```
    // GET /favicon.ico
    // Host: uniswap.eth
    // ```
    app.get('/*', async (req, res, next) => {
        res.setHeader('X-Special-Proxy-Header', 'foobar');

        const host = req.hostname
        if (!host || !host.length) return

        // For testing purposes.
        if (host == 'localhost') {
            res.write("localhost says hello!")
            res.end()
            return
        }

        // Resolve ENS to content hash.
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
            return next(new Error(`No content for ENS name "${ensName}", hash was ${hash}`))
        }

        if (!handler[codec]) {
            return next(new Error(`Dappnet cannot resolve ENS content type - multihash codec "${codec}"`))
        }

        handler[codec](req, res, next)
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
        } else {
            const pubkeyHash = req.ensData.hash
            const ipnsPath = `/ipns/${pubkeyHash}${req.path || '/'}`
            ipfsPath = await resolveIPNS(opts.ipfsNode, ipnsPath)
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
        let gatewayRes = await fetch(gatewayRewrite)

        await streamPipeline(gatewayRes.body, res);
        // res.send(gatewayRes.body)

        res.header = gatewayRes.headers.raw()
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
        res.status(500).send(`Dappnet - ${err.toString()}`)
    })

    const httpsServer = require('https').Server({
        key: fs.readFileSync(__dirname + '/../certs/kwenta.eth.key', 'utf8'),
        cert: fs.readFileSync(__dirname + '/../certs/kwenta.eth.crt', 'utf8'),
        SNICallback: sniCallback,
    }, app);

    httpsServer.listen(PROXY_PORT_HTTPS_INNER, () => {
        console.log(`Proxy server listening on https://localhost:${PROXY_PORT_HTTPS_INNER}`)
    })

    // HTTP.
    const httpServer = http.createServer(app);
    httpServer.listen(PROXY_PORT, () => {
        console.log(`Proxy server listening on http://localhost:${PROXY_PORT}`)
    })
}



module.exports = {
    start
};
