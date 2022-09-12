
dappnet
=======

## What is the Dappnet?

The Dappnet is a permissionless application network that can't be taken down. 

It uses .eth domain names, IPFS for P2P content distribution and location, and the web browser as the application platform.

The Dappnet suite of tools allows you to access `.eth` dapps in your browser (Firefox/Chrome), and publish to your `.eth` domains. There is no dependence on centralized gateways (.eth.limo, .eth.link) or servers.

What else? **Dappnet is fast. Way faster than you think.**.

## Foreward.

It's funny how life loops around. 10yrs ago, when I was ?15?, instead of drinking booze and having sex, I was being a fucking nerd and interested in [building decentralized DNS](https://github.com/liamzebedee/D3NS).

BitTorrent is the OG of P2P technology. And it's freaking usable - everyone I know knows how to download torrents. IPFS is so much harder, **even as developers** IPFS's API's are notoriously confusing.

What happened if browsing the web was like one big torrent? If every website you visited was downloaded from a P2P swarm? That's what Dappnet is. 

## Design.

- **browser extension**, compatible with Chrome/Firefox. Proxies .eth requests in-browser to a local SOCKS5 proxy server.
- **local-socks5-proxy**: proxies requests to the local IPFS/ENS gateway.
- **local-gateway**: looks up .eth domains, streams their content from multiple IPFS nodes. It dynamically generates HTTPS certificates in the background, for any .eth domain - since wildcard certificates are not available for non-standard TLD's like .eth. HTTPS is needed, otherwise dapps can't use libraries that use web sockets over TLS (wss://) due to mixed content policies of the browser. Has multiple layers of caching for DNSLink, ENS, and IPNS naming schemes.
- **desktop-app**: Electron app that bundles the proxy+gateway into one application, that can be started/stopped. Comes with a slick UI for accessing different dapps. Electron's really useful here because all the software is written in Node/JS.
- **.eth certificate authority**: a local certificate the user must install as the .eth root of trust.

## Acknowledgements.

In order of usage:

 - [BenMorel/dev-certificates](https://github.com/BenMorel/dev-certificates) - I used this to quickly generate self-signed certs, before implementing this `openssl` toolset in JS using `jrsasign`.
 - [chrome-bit-domain-extension](https://github.com/Tagide/chrome-bit-domain-extension.git) for their work in building this extension for the original decentralized DNS, Namecoin / .bit domains. They came up with the idea for dynamically proxying the web requests to a backend (they used HTTP, we use SOCKS5).
 - [sequoiar/socks5](https://github.com/sequoiar/socks5) - SOCKS5 proxy written in Node.js, which I've reused in this project.
 - [jrsasign](https://github.com/kjur/jsrsasign) - an absolutely cooked reimplementation of most of OpenSSL in JS.
 - [Zooko](https://en.wikipedia.org/wiki/Zooko_Wilcox-O%27Hearn). I'll never forget learning about [Zooko's triangle](https://en.wikipedia.org/wiki/Zooko%27s_triangle).
 - [IPFS](https://docs.ipfs.io/) and its inventor, Juan Benet. IPFS is an awesome tech stack, that I've really come to appreciate while building this (and reading their [whitepaper](https://raw.githubusercontent.com/ipfs/ipfs/master/papers/ipfs-cap2pfs/ipfs-p2p-file-system.pdf)). It's got a lot of subtle design detail that you only pickup when building with it.
 - [Ethereum Name System](https://docs.ens.domains/) and its builders. You guys did a good job. Worth reading the original [EIP](https://eips.ethereum.org/EIPS/eip-137) to see their soul in their work.
 - [Ethereum](https://ethereum.org) and its core devs. They don't get enough praise, we love you guys.
 - And the OG's before us - [BitTorrent](https://en.wikipedia.org/wiki/BitTorrent), you are the best.
