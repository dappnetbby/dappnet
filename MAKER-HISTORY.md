

iterations and things I had to learn:

- original idea, which was an in-browser js `<iframe>` which intercepted requests using serviceworkers and verified the hash
- 2nd iteration, I thought we would need an IPFS accelerator, but it seems IPFS is fast enough rn
- local client which used cloudflare/fleek ipfs (until we got rate-limited)
- local js-ipfs node, which didn't work.
- local kubo node + dappnet. wrangling with ipfs migration crap.
- bundled ipfs node inside dappnet.
- uniswap.eth resolves to the weirdest hash. fixing this.
- understand content hashes. ipfs cid's and different multiformats.
- writing web extensions.
- proxies - http/https/socks5. trying which one fits.
- how to generate a wildcard certificate for .eth using openssl?
- how to generate a wildcard CA for .eth?
- how to generate wildcard CA's, ON-THE-FLY for .eth? (hint: SNI)
- how to generate wildcard CA's, ON-THE-FLY, for .eth, in JS so it's cross-platform?
- writing up an installation guide for v1 - https://gist.github.com/liamzebedee/963b5a704e47db0d34541cc0477cc587
- debugging macos security perms for arm64 vs. amd64.
- installing a certificate authority on macOS.
- installing it as part of a .pkg installer. debugging .pkg installers on macOS
- release pipeline for extensions.
- getting an icon for dappnet
- resizing the icon manually, in different formats, for browser and desktop
- writing up an installation guide for v2 - https://gist.github.com/liamzebedee/b7f71f5006ffeb4580c64f8767568c59
- helping lyra guys out with configuring lyra.eth
- designing copy for where the .eth domains don't resolve properly. ie. "There was no content found for lyra.eth"
- how to implement automatic updates for the application? trying multiple update servers
- how to do notarization and code signing, with an additional external binary on macOS
- designed an install page using walletconnect, including a dappnet:// url scheme
- started updating the install guide v3, when I thought - hey, maybe I could remove the extension install step? 30mins later. client supports .eth natively.