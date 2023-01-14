# Dappnet design.

## How does Dappnet work?

Dappnet is a name for a combination of technologies and architectural approach, much like [JAMStack](https://en.wikipedia.org/wiki/Jamstack). 

 - Decentralized apps ("dapps") are built atop the web runtime, using HTML/CSS/JS.
 - They are compiled into a static bundle ([SPA](https://en.wikipedia.org/wiki/Single-page_application)) and published to IPFS.
 - The IPFS network distributes content using P2P swarms à la BitTorrent. It is robust to censorship, and functions as a built-in CDN.
 - Developers buy `.eth` domains, which they point to their IPNS address (an IPFS address whose content can be updated).
 - Users access dapps like [uniswap.eth](https://uniswap.eth) in their browser. Their local IPFS node contributes resources to the P2P network.

In terms of architecture, these are the following layers:

 - **A naming system**: unlike DNS, ENS is a universal username. An ENS name can refer to content (IPFS), payment addresses (ETH, BTC) and social profiles (twitter, etc.). Developers can publish content to ENS names, and users can configure their ENS name with rich information useful in applications.
 - **A hypermedia protocol**. IPFS is a protocol that uses content-addressing (`hash(content) -> content`), which is more robust than location-addressing (`IP -> content`) used in HTTP. No more broken links.
 - **A content distribution network**. IPFS is a P2P protocol that distributes content like BitTorrent. It is in essence, a globally-functioning P2P CDN.
 - **A web browser**. Web browsers provide us the application platform to run apps, using HTML, CSS and JS.
 - **Decentralized and centralized backends**. Applications use a mixture of decentralized backends (blockchains, indexers like [The Graph](https://thegraph.com/en/)) and centralized backends (e.g. [Zora's API](https://api.zora.co/), [Farcaster Hubs](https://github.com/farcasterxyz/protocol)) to provide the database and backend API's.

## How do I publish?

 1. Buy a .eth domain on [ENS](https://app.ens.domains/).
 2. Generate an IPNS (IPFS Naming System) keypair. This is your keypair you use to publish.
    
    e.g. `/ipns/12D3KooWBC7KN4WoiFPYXhd22wFa2daSTkkTAeDcEDQfxBDHY3tP`.
 3. Set the content hash for your domain to your IPNS keypair.
 4. Publish content to your IPNS.

## Overview.

Dappnet is composed of multiple pieces:

 - a browser extension.
 - a SOCKS5 proxy.
 - a local gateway.
 - an optimized IPFS node for speed of access.
 - a .eth certificate authority.

## Components.

### Browser extension.

Compatible with Chrome/Firefox. Proxies .eth requests in-browser to a local SOCKS5 proxy server.

### Local SOCKS5 Proxy.

Proxies requests to the local gateway. 

The gateway provides for both HTTP and HTTPS connections. Port 10422 serves HTTP, port 10424 serves HTTPS.

The SOCKS5 proxy rewrites the network requests automatically:

```sh
# proxy rewrite schema
localhost:80  -> localhost:10422
localhost:443 -> localhost:10424
```

The proxy is hosted on `localhost:6801`.

### Local gateway.

 * Resolves .eth content hashes. Supports resolution of DNSLink, IPNS, and IPFS hashes.
 * Streams content from the local IPFS node.
 * Provides HTTPS connections to .eth dapps. HTTPS is needed, otherwise dapps can't use libraries that use web sockets over TLS (wss://) due to mixed content policies of the browser. Wildcard certificates are not available for non-standard TLD's like .eth. So the gateway dynamically generates HTTPS certificates for all .eth domains, on-demand.
 * Caches DNSLink, ENS, and IPNS resolutions for the best UX possible.

### Desktop app.

 * Bundles 3 different services:
   * proxy
   * local gateway
   * an IPFS node
 * All automatically started and stopped.
 * Comes with a slick UI for accessing different dapps.

### Local IPFS node.

Automatically configured to peer with Cloudflare for optimum performance.

### Local .eth certificate authority.

A local certificate the user must install as the .eth root of trust.

