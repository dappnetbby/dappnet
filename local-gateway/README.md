local-gateway
=============

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