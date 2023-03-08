Cloning Dappnet over IPFS
=========================

This is fucking wild. The Dappnet source code cannot be stopped. It is distributed over Dappnet itself.

## Distribution.

```sh
cd personal-dappsites/
mkdir git.anticaptive.eth
cd git.anticaptive.eth
git clone --bare ../../ dappnet.git
cd dappnet.git
git update-server-info

# Now upload to IPFS.
ipfs add -r git.anticaptive.eth

# Get the root CID

# Create an IPNS name.
ipfs key gen git.anticaptive
# Now publish.
ipfs name publish --key git.anticaptive YOUR_DIRECTORY_CID
```

## Cloning.

```sh
ALL_PROXY=http://127.0.0.1:10422 git clone http://git.anticaptive.eth/dappnet.git
```

How the hell does this work? Well turns out, Git supports proxies, and the Dappnet local gateway functions as a HTTP proxy. By setting `ALL_PROXY`, we can run Git through Dappnet's client, and effectively download the source code over IPFS and ENS!

A note - there are two kinds of HTTP proxies - one for HTTPS, which uses the `CONNECT` HTTP method, and the simpler HTTP proxy. Since the proxy is running locally, there is no need for HTTPS security.

