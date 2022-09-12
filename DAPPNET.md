# The Dappnet.

The Dappnet is a permissionless application network that can't be taken down. 

The Dappnet is a combination of technologies - [ENS](https://ens.domains/) as a permissionless name infrastructure, [IPFS](https://en.wikipedia.org/wiki/InterPlanetary_File_System) as a P2P hypermedia protocol, and the browser as the application platform.

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



