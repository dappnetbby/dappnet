// NOTE: this client doesn't even WORK for the current HTTP API's - ipfs.key.import.
const IPFSHttpClient = require('ipfs-http-client')
const glob = require('glob')
const { mkdtemp, writeFile } = require('node:fs/promises')
const { join, resolve, relative } = require('node:path')
const os = require('node:os')
const crypto = require('node:crypto')
const FormData = require('form-data')
const fetch = require('node-fetch')
const { readFileSync, lstatSync } = require('node:fs')

// IPNS/IPFS complaints:
// - ipfs.key.import should accept the key as a value (not a file), so we can import like an env var.
// - ipfs.key.import logs the error on import, which includes the private key, in the URL

function importKeyJsIpfs() {
    // js-ipfs is fucking stupid, and requires us to read the key from a file.
    // EDIT: js-ipfs doesn't even work for the current HTTP API's. DURRR.

    // Generate a temporary directory where we write the key to a file.
    // NOTE: This is horribly insecure. Anyone can read the file at /$TEMPDIR/x
    // const tempDir = await mkdtemp(join(os.tmpdir(), ''))
    // const TEMP_IPNS_KEY_PATH = join(tempDir, '/x')
    // const tempPEMFile = await writeFile(TEMP_IPNS_KEY_PATH, DAPPNET_IPNS_KEY, { encoding: 'utf-8' })
    
    // Import the file.
    // const ipnsKey = await ipfs.key.import(IPNS_KEYNAME, TEMP_IPNS_KEY_PATH, '')
}

async function importKey({ ipfsNode, keyPem }) {
    console.log('Importing key...')
    // https://docs.ipfs.tech/reference/kubo/rpc/#api-v0-key-import
    const IPFS_HTTP_RPC_API_KEY_IMPORT = `/key/import`

    // Name the imported key with a randomly assigned name.
    // e.g. `dappnet-deploy-e9fdf2ab80b9fc7b83b7e8bf7435464c`
    const keyNameNonce = crypto.randomBytes(16).toString('hex');
    const ipfsKeyName = `dappnet-deploy-` + keyNameNonce

    // Import the plaintext key file.
    // TODO: warn/verify HTTPS endpoint for non-localhost.
    const args = `arg=${ipfsKeyName}&allow-any-key-type=true&format=pem-pkcs8-cleartext`
    const formData = new FormData()
    formData.append('blob', keyPem, 'key.pem')

    // Perform HTTP request.
    const res = await fetch(`${ipfsNode}${IPFS_HTTP_RPC_API_KEY_IMPORT}?${args}`, {
        method: 'POST',
        body: formData
    })

    // Extract result.
    if (!res.status == 200) {
        console.error(res)
        throw new Error("IPFS RPC failed unexpectedly")
    }

    const json = await res.json()
    const keyId = json.Id

    return keyId
}

async function deploy(argv) {
    // Argument validation.
    const { dir, ipfsNode, ipns } = argv
    const { DAPPNET_IPNS_KEY } = process.env
    
    if (!DAPPNET_IPNS_KEY) {
        throw new Error("DAPPNET_IPNS_KEY is not defined.")
    }

    // Setup IPFS.
    const ipfs = IPFSHttpClient.create(new URL(ipfsNode))

    // Import the key using the ipfs-go HTTP RPC API.
    // 
    const keyId = await importKey({
        ipfsNode,
        keyPem: DAPPNET_IPNS_KEY
    })


    // Now publish the directory
    console.log(resolve(dir))
    console.log(join(resolve(dir), '/**/*'))
    const files = glob.sync(join(resolve(dir), '/**/*'))
    console.log(files)

    // await user input
    const stdin = process.openStdin()
    stdin.addListener("data", function(d) {
        console.log("you entered: [" + d.toString().trim() + "]");
    });

    // console.log(`Files:`)
    // console.log(files)

    // Convert files to IFPS format.
    const files1 = files.map(file => {
        // Get relpath.
        const relpath = relative(dir, file)

        const isDir = lstatSync(file).isDirectory()
        const content = isDir ? null : readFileSync(file)

        return {
            relpath,
            isDir,
            content
        }
    })

    const keyNameNonce = crypto.randomBytes(64).toString('hex');
    const dirName = `dappnet-deploy-` + keyNameNonce
    
    const files2 = files1.map(file => {
        // const path = join(dirName + '/', relpath)
        const { content, relpath } = file
        const path = '/' + relpath
        return {
            path,
            content
        }
    })

    const addOptions = {
        pin: true,
        wrapWithDirectory: true,
        timeout: 10000
    };

    console.log(`Publishing files to IPFS...`)
    let ipfsFiles = []
    for await (const file of ipfs.addAll(files2, addOptions)) {
        ipfsFiles.push(file)
        const { path, cid } = file
        console.log(`  /ipfs/${cid}/`, '/' + path)
    }

    const rootFile = ipfsFiles.filter(file => file.path == '')[0]
    // console.log(rootFile.cid)


    // And finally, update the IPNS name.
    console.log('Updating IPNS record...')
    console.log(`    Key: /ipns/${keyId}`)
    console.log(`  Value: /ipfs/${rootFile.cid}`)
    const res = await ipfs.name.publish(rootFile.cid, { key: keyId })
    
    console.log('Done')
    console.log('Your site should be available on these gateways soon:')
    const gateways = [
        'https://cloudflare-ipfs.com',
        'https://ipfs.fleek.co',
    ]
    gateways.map(gateway => {
        console.log(`  ${gateway}/ipfs/${rootFile.cid}/`)
    })
}


require('yargs')
    .scriptName("dappnet")
    .usage('$0 <cmd> [args]')
    .command('deploy', 'deploy the dir', (yargs) => {
        yargs
        .option('dir', {
            type: 'string',
            describe: 'the directory to publish'
        })
        .option('ipfs-node', {
            type: 'string',
            describe: 'the URL to the IPFS node we are using to publish.',
            default: "http://localhost:5001/api/v0"
        })
        .option('ipns', {
            type: 'string',
            describe: 'Update an IPNS name. The private key should be set in the environment variable, DAPPNET_IPNS_KEY.'
        })
        .demandOption(['dir', 'ipns'], '')
    }, deploy)
    .help()
    .argv