
dappnet
=======

> some cool ass quote that's relevant to freedom.\

Access .eth dapps that can't be taken down.

Dappnet is a decentralized solution to accessing .eth dapps and websites. No more gateways like .eth.limo, now .eth domains are natively handled by your browser! The system is fully decentralized and can't be taken down - .eth domains can't be seized, and their content is on IPFS, so it can't be censored either.

## Foreward.

It's funny how life loops around. 10yrs ago, when I was ?15?, instead of drinking booze and having sex, I was being a fucking nerd and interested in [building decentralized DNS](https://github.com/liamzebedee/D3NS).

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
 - Zooko. I'll never forget learning about [Zooko's triangle](https://en.wikipedia.org/wiki/Zooko%27s_triangle).
 - IPFS and its inventor, Juan Benet. IPFS is an awesome tech stack, that I've really come to appreciate while building this (and reading their [whitepaper](https://raw.githubusercontent.com/ipfs/ipfs/master/papers/ipfs-cap2pfs/ipfs-p2p-file-system.pdf)). It's got a lot of subtle design detail that you only pickup when building with it.
 - ENS devs.
 - Ethereum core devs.

