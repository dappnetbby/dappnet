

iterations and things I had to learn:

- original idea, which was an in-browser js `<iframe>` which intercepted requests using serviceworkers and verified the hash - https://github.com/liamzebedee/dapploy https://docs.google.com/document/d/14NH4FaWkbKjBMfaX7jsSFMd8lhfuqMeFjjyj8uVz_tM/edit?usp=sharing
- 2nd iteration, I thought we would need an IPFS accelerator, but it seems IPFS is fast enough rn https://glissco.notion.site/Decentralized-front-ends-039b2edbb7914377867d609119d92d25
- local client which used cloudflare/fleek ipfs (until we got rate-limited)
- local js-ipfs node, which didn't work.
- local kubo node + dappnet. wrangling with ipfs migration crap.
- bundled ipfs node inside dappnet.
- uniswap.eth resolves to the weirdest hash. fixing this.
- understand content hashes. ipfs cid's and different multiformats.
- writing web extensions.
- experimented with showing the link to the IPFS file inside the extension UI. this was engineered ugly af. not simple enough.
- proxies - http/https/socks5. trying which one fits.
- how to generate a wildcard certificate for .eth using openssl?
- how to generate a wildcard CA for .eth?
- how to generate wildcard CA's, ON-THE-FLY for .eth? (hint: SNI)
- how to generate wildcard CA's, ON-THE-FLY, for .eth, in JS so it's cross-platform?
- writing up an installation guide for v1 - https://gist.github.com/liamzebedee/963b5a704e47db0d34541cc0477cc587
- debugging macos security perms for arm64 vs. amd64.
- installing a certificate authority on macOS.
- installing the cert as part of the UI (click a button after install).
- installing it as part of a .pkg installer. debugging .pkg installers on macOS
- release pipeline for extensions.
- getting an icon for dappnet
- resizing the icon manually, in different formats, for browser and desktop
- writing up an installation guide for v2 - https://gist.github.com/liamzebedee/b7f71f5006ffeb4580c64f8767568c59
- helping lyra guys out with configuring lyra.eth
- designing copy for where the .eth domains don't resolve properly. ie. "There was no content found for lyra.eth"
- how to implement automatic updates for the application? trying multiple update servers
- tried using rpc provider from a16z. was censored.
- how to do notarization and code signing, with an additional external binary on macOS
- designed an install page using walletconnect, including a dappnet:// url scheme
- started updating the install guide v3, when I thought - hey, maybe I could remove the extension install step? 30mins later. client supports .eth natively.
- played with running dapps as native desktop apps using chrome cli
- tried building .eth browsing into the client as an extension (failed)
- tried building .eth browsing into the client as a proxy (worked)
- dappnet:// URI scheme became useful for opening apps outside of client
- started playing with building in a wallet / rpc provider.
