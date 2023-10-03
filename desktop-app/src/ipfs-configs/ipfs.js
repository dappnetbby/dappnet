module.exports = {
    "Identity": {
        "PeerID": "12D3KooWNucyQVS85JRkJwuouZRTwL3xYjWEfSskpZ4qzXHTtjdt",
        "PrivKey": "CAESQPSoeMYI+Vs4sT4+DqL4N2yMyZcVrgsSmD5+8r8dZjnHwoCS1zvOnWc3s2ZiAucT5wOKK8qAtBoTjU3gHRsVC9s="
    },
    "Datastore": {
        "StorageMax": "10GB",
        "StorageGCWatermark": 90,
        "GCPeriod": "1h",
        "Spec": {
            "mounts": [
                {
                    "child": {
                        "path": "blocks",
                        "shardFunc": "/repo/flatfs/shard/v1/next-to-last/2",
                        "sync": true,
                        "type": "flatfs"
                    },
                    "mountpoint": "/blocks",
                    "prefix": "flatfs.datastore",
                    "type": "measure"
                },
                {
                    "child": {
                        "compression": "none",
                        "path": "datastore",
                        "type": "levelds"
                    },
                    "mountpoint": "/",
                    "prefix": "leveldb.datastore",
                    "type": "measure"
                }
            ],
            "type": "mount"
        },
        "HashOnRead": false,
        "BloomFilterSize": 0
    },
    "Addresses": {
        "Swarm": [
            "/ip4/0.0.0.0/tcp/4001",
            "/ip6/::/tcp/4001",
            "/ip4/0.0.0.0/udp/4001/quic",
            "/ip4/0.0.0.0/udp/4001/quic-v1",
            "/ip4/0.0.0.0/udp/4001/quic-v1/webtransport",
            "/ip6/::/udp/4001/quic",
            "/ip6/::/udp/4001/quic-v1",
            "/ip6/::/udp/4001/quic-v1/webtransport"
        ],
        "Announce": [],
        "AppendAnnounce": [],
        "NoAnnounce": [],
        "API": "/ip4/127.0.0.1/tcp/5001",
        "Gateway": "/ip4/127.0.0.1/tcp/8080"
    },
    "Mounts": {
        "IPFS": "/ipfs",
        "IPNS": "/ipns",
        "FuseAllowOther": false
    },
    "Discovery": {
        "MDNS": {
            "Enabled": true
        }
    },
    "Routing": {
        "Routers": null,
        "Methods": null
    },
    "Ipns": {
        "RepublishPeriod": "",
        "RecordLifetime": "",
        "ResolveCacheSize": 128
    },
    "Bootstrap": [
        "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
        "/ip4/104.131.131.82/udp/4001/quic/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
        "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt"
    ],
    "Gateway": {
        "HTTPHeaders": {
            "Access-Control-Allow-Headers": [
                "X-Requested-With",
                "Range",
                "User-Agent"
            ],
            "Access-Control-Allow-Methods": [
                "GET"
            ],
            "Access-Control-Allow-Origin": [
                "*"
            ]
        },
        "RootRedirect": "",
        "Writable": false,
        "PathPrefixes": [],
        "APICommands": [],
        "NoFetch": false,
        "NoDNSLink": false,
        "PublicGateways": null
    },
    "API": {
        "HTTPHeaders": {}
    },
    "Swarm": {
        "AddrFilters": null,
        "DisableBandwidthMetrics": false,
        "DisableNatPortMap": false,
        "RelayClient": {},
        "RelayService": {},
        "Transports": {
            "Network": {},
            "Security": {},
            "Multiplexers": {}
        },
        "ConnMgr": {},
        "ResourceMgr": {}
    },
    "AutoNAT": {},
    "Pubsub": {
        "Router": "",
        "DisableSigning": false
    },
    "Peering": {
        "Peers": null
    },
    "DNS": {
        "Resolvers": {}
    },
    "Migration": {
        "DownloadSources": [],
        "Keep": ""
    },
    "Provider": {
        "Strategy": ""
    },
    "Reprovider": {},
    "Experimental": {
        "FilestoreEnabled": false,
        "UrlstoreEnabled": false,
        "GraphsyncEnabled": false,
        "Libp2pStreamMounting": false,
        "P2pHttpProxy": false,
        "StrategicProviding": false,
        "AcceleratedDHTClient": false
    },
    "Plugins": {
        "Plugins": null
    },
    "Pinning": {
        "RemoteServices": {}
    },
    "Internal": {}
}