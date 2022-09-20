dappnet
=======

![image](https://user-images.githubusercontent.com/584141/190630673-3aea2cd3-0f41-46d3-a06a-84c1f7da3e1b.png)

## What is the Dappnet?

The Dappnet is a permissionless application network that can't be taken down. 

It uses .eth domain names, IPFS for P2P content distribution and location, and the web browser as the application platform.

The Dappnet suite of tools allows you to access `.eth` dapps in your browser (Firefox/Chrome), and publish to your `.eth` domains. There is no dependence on centralized gateways (.eth.limo, .eth.link) or servers.

What else? **Dappnet is fast. Way faster than you think.**.

## Install.

Currently supports macOS with Chrome/Firefox.

[Install guide](https://gist.github.com/liamzebedee/b7f71f5006ffeb4580c64f8767568c59).

## Learn more.

 - [DESIGN.md](./DESIGN.md) contains a breakdown of the software.
 - [Making your own .eth website](https://gist.github.com/liamzebedee/53e355430941d9c79b7b5541298801db).

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
