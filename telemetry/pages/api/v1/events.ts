// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { MongoClient, ServerApiVersion } from "mongodb"


// Connect to database.
const mongoDBUri = process.env.MONGODB_URI;

if (!mongoDBUri) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env'
    )
}


// Create only once.
// https://www.mongodb.com/docs/atlas/manage-connections-aws-lambda/
const client = new MongoClient(mongoDBUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

const testDocs = `
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
`.split("\n").filter(Boolean).map((line: string) => {
    const a = line.split(" ").map((s: string) => s.trim()).filter(Boolean)
    const [source, event, ...args] = a
    const obj = {
        source,
        event,
        args,
    }
    return obj
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const body = req.body;

    console.log(mongoDBUri)

    console.log(testDocs)

    try {
        // await client.connect();
        await client.db("dappnet").collection("telemetry1").insertMany([{ a: Math.random() }])
    } finally {
        // await client.close();
    }
    
    res.status(200).json(body)
}
