
const PROXY_PORT_HTTP = 10422
const PROXY_PORT_HTTPS = 10424
const IPFS_NODE_API_URL = `http://127.0.0.1:5001`
const HANDLED_TLDS = 'eth dappnet ipfs'.split(' ')

// NOTE: If the host below is specified as localhost, the ipfs-node software will
// perform a 301 redirect to baf_ENCODED_HASH.ipfs.localhost. We don't want this,
// since node-fetch can't handle it.
const IPFS_HTTP_GATEWAY = 'http://127.0.0.1:8080'

module.exports = {
    PROXY_PORT_HTTP,
    PROXY_PORT_HTTPS,
    IPFS_NODE_API_URL,
    IPFS_HTTP_GATEWAY,
    HANDLED_TLDS
}
