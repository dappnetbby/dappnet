dappnet
=======

![image](https://user-images.githubusercontent.com/584141/190630673-3aea2cd3-0f41-46d3-a06a-84c1f7da3e1b.png) 

[Documentation](https://liamzebedee.gitbook.io/dappnet/) &middot; [Discord](https://discord.gg/mZUK6reQwT) &middot; [Twitter](https://twitter.com/dappnetbby)

## What is Dappnet?

Dappnet is a portal to decentralized frontends. Using Dappnet, anyone can publish a dapp/website under their .eth domain, and users can access it **seamlessly** using their browser - just type `uniswap.eth`. All content is hosted on IPFS, and there is no dependence on centralized gateways (.eth.limo, .eth.link) or servers.

The software consists of a desktop app, which bundles a local IPFS node, local ENS gateway, and [some other good stuff](./DESIGN.md), and a browser extension. All of this complexity is hidden from the user - [check out the demo vid to see](https://i.imgur.com/EWdEqeZ.mp4).

## Install.

Currently supports macOS with Chrome/Firefox.

Follow the [install guide](https://liamzebedee.gitbook.io/dappnet/install/guide).

## Learn more.

The Dappnet documentation is officially located [here](https://liamzebedee.gitbook.io/dappnet/), and contributions are welcomed in the [`dappnet-docs` repo](https://github.com/liamzebedee/dappnet-docs).

 - [Dappnet's architecture](https://liamzebedee.gitbook.io/dappnet/overview/technical-architecture).
 - [Deploying to Dappnet](https://liamzebedee.gitbook.io/dappnet/deploying-to-dappnet/overview).
 - [Maker journal](./MAKER-JOURNAL.md) - history of the hacks I had to do.

## Tools.

Some useful tools for hackers:

 - [ipfs-tools](./ipfs-tools/) - helper for deploying websites to remote IPFS nodes, updating the IPNS name automatically.
 - [local-gateway/utils/ens.js](./local-gateway/utils/ens.js) - helper for ENS resolution (shows DNSLink, IPFS, IPNS).

## License

Dappnet is licensed under a Business Source License, similar to our friends at Uniswap and Aave. See [LICENSE](./LICENSE).

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
