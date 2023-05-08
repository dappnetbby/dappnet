local-gateway
=============

This is an IPFS HTTP gateway which resolves ENS domains to IPFS content ID's, and proxies requests to an IPFS node which returns the underlying content. It automagically generates SSL certificates for all requests, on-the-fly.

For example, for `kwenta.eth`, a request is a `GET /` with the `Host` header set to `kwenta.eth`. It will resolve `kwenta.eth` to an IPFS content hash, and then load the root file from that bundle. If you are requesting a path on a host, for example, `https://kwenta.eth/favicon.ico`, you can query this by setting the path to `/favicon.ico`, and the `Host` remains as `kwenta.eth`.

## Usage.

To use the gateway locally, you need a copy of the Dappnet CA's private keys in order to sign. 

If you've already installed Dappnet, these have been installed and generated for you. You can copy them locally using `cp -R /Applications/Dappnet.app/Contents/Resources/app.asar.unpacked/node_modules/@dappnet/local-gateway/dappnet-ca/data dappnet-ca/data`.

If you would like to generate new keys, simply `cd dappnet-ca/` and run `./create-ca.sh`.

Then you can run the server:

```sh
npm i
npm run start
```

## Testing the gateway locally.

```
curl --header "Host: kwenta.eth" http://127.0.0.1:10422 & curl --header "Host: ens.eth" http://127.0.0.1:10422 & curl --header "Host: curve.eth" http://127.0.0.1:10422
```


## Tools.

Resolving ENS using `utils/ens.js`:

```
(base) ➜  local-gateway git:(master) ✗ node utils/ens.js contenthash liamz.eth
ens.getResolver(liamz.eth): 461.649ms
resolver.getContentHash(liamz.eth): 797.895ms
ipnsPath: /ipfs/QmUbPLjPjiK8yL2jAVX7dLA6tmqDZR67t1Y5uTYgf2GKPA
contentHash: e50101720024080112209fad50629406a683d4238797fc1b813a27102163d43ed121b0d4a8ba050c2d0d
codec: ipns-ns
hash: 12D3KooWLZgGm59TU5nnteDVgGGCNhZ1zFK2VzFC6C13xMh1eRLQ
hash (hex): 0024080112209fad50629406a683d4238797fc1b813a27102163d43ed121b0d4a8ba050c2d0d
hash (raw str): "\u0000$\b\u0001\u0012 ��Pb�\u0006���#���\u001b�:'\u0010!c�>�!�Ԩ�\u0005\f-\r"
dnsLinkName: undefined
getContentHash: 1.289s
```