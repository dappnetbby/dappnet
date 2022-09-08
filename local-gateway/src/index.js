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

const {
    testENS,
    resolveENS
} = require('./ens')

const { 
    generateCertificate,
    generateCertificateOpenSSL
} = require('./certificates')

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



function start(opts = {
    ipfsNode: null
}) {
    testENS()
    const app = express();

    const proxyToGateway = async (host, gatewayUrl, res) => {
        console.log(host, gatewayUrl)
        let gatewayRes = await fetch(gatewayUrl)

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
        res.status(500).send('Something broke!')
    })

    // The core of the IPFS gateway.
    let ipfsGateway
    if (opts.ipfsNode) {
        ipfsGateway = opts.ipfsNode
    } else {
        ipfsGateway = "https://ipfs.fleek.co"
    }

    app.get('/*', async (req, res, next) => {
        res.setHeader('X-Special-Proxy-Header', 'foobar');

        const host = req.hostname
        if (!host || !host.length) return
        if (host == 'localhost') {
            res.write("localhost says hello!")
            res.end()
            return
        }

        let codec, hash
        try {
            ({ codec, hash } = await resolveENS(host));
        } catch(err) {
            return next(err)
        }

        let gatewayRewrite
        console.log(host, codec, hash)
        // gatewayRewrite = `https://cloudflare-ipfs.com/ipfs/${cid}/${req.path}` // cloudflare gateway
        // const gatewayRewrite = `https://cloudflare-ipfs.com/ipfs/${cid}/${req.path}` // cloudflare gateway
        // const gatewayRewrite = `http://localhost:8080/ipfs/${cid}${req.path}`

        if (codec == 'ipfs-ns') {
            gatewayRewrite = `${ipfsGateway}/ipfs/${hash}${req.path}`
        } else if(codec == 'ipns-ns') {
            gatewayRewrite = `${ipfsGateway}/ipns/${hash}${req.path}`
        } else {
            gatewayRewrite = `https://${host}.limo${req.path}` // .eth.limo
        }

        try {
            await proxyToGateway(host, gatewayRewrite, res)
            return
        } catch (err) {
            return next(err)
        }
    });

    // Autogenerate a certificate for any .eth domain, as a part of the Server Name Identification (SNI) callback in the TLS protocol.
    const sniCallback = (serverName, callback) => {
        console.log('sni', serverName)

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
        } catch(err) {
            console.error(err)
            callback(new Error("couldn't dynamically create cert for domain - " + serverName))
        }
    }

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
