const fs = require('fs')
const https = require('https');
const express = require('express');

var http = require('http'),
    httpProxy = require('http-proxy');






const app = express();

app.get('/', (req, res) => {
    console.log(1, req.method)

    res.write('hello')
    res.end()
})

const httpsServer = https.createServer(
    {
        key: fs.readFileSync(__dirname + '/eth.key', 'utf8'),
        cert: fs.readFileSync(__dirname + '/eth.crt', 'utf8')
    },
    app
);

httpsServer.listen(10422, () => {
    console.log(`CDN server listening on https://localhost:10422`)
})


//
// Create your proxy server and set the target in the options.
//
const proxyApp = httpProxy.createProxyServer({ 
    ssl: {
        key: fs.readFileSync(__dirname + '/localhost.key', 'utf8'),
        cert: fs.readFileSync(__dirname + '/localhost.crt', 'utf8')
    },
    target: 'http://localhost:10422' 
})

proxyApp.listen(10424, () => {
    console.log(`Proxy server listening on https://localhost:10424`)
})




// var tunnel = require('tunnel');
// const fs = require('fs')


// var tunnelingAgent = tunnel.httpsOverHttps({
//     // maxSockets: poolSize, // Defaults to http.Agent.defaultMaxSockets

//     // CA for origin server if necessary
//     // ca: [fs.readFileSync('origin-server-ca.pem')],
//     // ca: [fs.readFileSync(__dirname + '/eth.crt', 'utf8')],

//     // Client certification for origin server if necessary
//     key: fs.readFileSync(__dirname + '/eth.key', 'utf8'),
//     cert: fs.readFileSync(__dirname + '/eth.crt', 'utf8'),

//     proxy: { // Proxy settings
//         host: 'localhost', // Defaults to 'localhost'
//         port: 10424, // Defaults to 443
//         localAddress: 'localhost', // Local interface if necessary

//         // Basic authorization for proxy server if necessary
//         // proxyAuth: 'user:password',

//         // Header fields for proxy server if necessary
//         // headers: {
//         //     'User-Agent': 'Node'
//         // }

//         // CA for proxy server if necessary
//         // ca: [fs.readFileSync('origin-server-ca.pem')],

//         // Server name for verification if necessary
//         servername: 'localhost',

//         // Client certification for proxy server if necessary
//         key: fs.readFileSync(__dirname + '/localhost.key', 'utf8'),
//         cert: fs.readFileSync(__dirname + '/localhost.crt', 'utf8'),
//     }
// });
