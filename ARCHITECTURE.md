
- **browser extension**, compatible with Chrome/Firefox. Proxies .eth requests to a local SOCKS5 proxy server.
- **local-socks5-proxy**: proxies requests to the local IPFS/ENS gateway.
- **local-gateway**: looks up .eth domains, streams their content from multiple IPFS nodes. It dynamically generates HTTPS certificates in the background, for any .eth domain - since wildcard certificates are not available for non-standard TLD's like .eth. HTTPS is needed, otherwise dapps can't use libraries that use web sockets over TLS (wss://) due to mixed content policies of the browser.
- **desktop-app**: Electron app that bundles the proxy+gateway into one application, that can be started/stopped. Comes with a slick UI for accessing different dapps. Electron's really useful here because all the software is written in Node/JS.
