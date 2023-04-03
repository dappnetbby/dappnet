Data
====

An outline of the data we're collecting.

## R&D context.

 - Resolution speeds for .eth domains.
 - Resolution speeds for IPFS content.
 - Resource usage for P2P downloads (CPU, network, storage).
 - Convenience of Dappnet homescreen launcher.
 - Convenience of which dapps are useful for users (consequence: come pre-installed by default).

## Schema.

```sh
# Rough format:
# SOURCE       EVENT-NAME   ...ARGS

update-server  pageview      path ip

desktop-app    open          install-id time platform=macOS version
desktop-app    close         install-id time platform=macOS version
desktop-app    upgrade       install-id from-version to-version
desktop-app    launch-dapp   install-id dapp-id time version

extension      popup-open    platform=[chrome,firefox] time version

local-gateway  resolve-ens   install-id rpc-node ensname time-to-resolve cached
local-gateway  resolve-ipns  install-id ipfs-node cid time-to-resolve cached
local-gateway  resolve-ipfs  install-id ipfs-node ensname cid time-to-resolve

desktop-app    ipfs-monitor  install-id datetime ipfs-daemon-tag ipfs-libp2p-peerid cpu-usage net-usage storage-usage
```

10K pageview = 10K * 120B

resolve ens/ipfs/ipns = 

50 opens * 5000 users * 30 days * 120B = 
