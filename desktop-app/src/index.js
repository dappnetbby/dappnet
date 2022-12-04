import * as sourceMap from 'source-map-support';
sourceMap.install();
import * as path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';

import {app, BrowserWindow, shell} from 'electron';
import electronIsDev from 'electron-is-dev';
import serve from 'electron-serve';
import * as IPFSHttpClient from 'ipfs-http-client';

import * as LocalGateway from '@dappnet/local-gateway';
import * as LocalSocksProxy from '@dappnet/local-socks5-proxy';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as _ from 'lodash'
import { ipfsConfigForFastTeens } from './ipfs';
import * as yargs from 'yargs'
import { autoUpdater } from 'electron';
import { app } from 'electron'
import { xor } from 'lodash';



// Print a banner on startup.
function smashIt() {
    console.log(`dappnet v${app.getVersion()}`)
    console.log(`Do what you think is based work.`)
    console.log(``)
    console.log(``)
}
smashIt()


// 
// Configure automatic updates.
//




// Fetch the updates from a file hosted on git.

function configureAutomaticUpdates() {
    const repo = 'liamzebedee/dappnet'
    const updateServerBase = 'https://dappnet-update-server-pi.vercel.app'
    const updateServerUrl = `${updateServerBase}/update/${process.platform}/${app.getVersion()}`
    // const updateManifestLocation = 'https://raw.githubusercontent.com/gliss-co/undisclosed/master/___________'

    console.log(`updateServerUrl: ${updateServerUrl}`)

    // {"name":"v1.2.2","notes":"","pub_date":"2022-12-04T02:28:16Z","url":"https://dappnet-update-server-gszxsxhhl-liamzebedee.vercel.app/download/darwin?update=true"}
    // const update = {
    //     "name": "v1.2.2",
    //     "notes": "",
    //     "pub_date": "2022-12-04T02:28:16Z",
    //     "url": ""
    // }

    // What makes up a release?
    // (os=[darwin], arch=[amd64, arm64], version=[*])

    // How do we work this? 
    // Releases are signed by a private keypair.
    // The public key is embedded on-chain.

    // 1. Publish the release on a CDN.
    // 2. Publish the release on BitTorrent/IPFS.
    // 3. Update the latest release manifest.



    // if (app.isPackaged) {
    // }

    autoUpdater.setFeedURL({
        // url: "file:///Users/liamz/Documents/Projects/dappnet/desktop-app/test/auto-update/update.json"
        url: updateServerUrl
    })

    autoUpdater.checkForUpdates()


    // setInterval(() => {
    //     autoUpdater.checkForUpdates()
    // }, 5000)

    const log = console.log
    autoUpdater.on('error', function () {
        console.log(arguments)
    })

    autoUpdater.on('error', err => {
        log('updater error')
        log(err)
    })

    autoUpdater.on('checking-for-update', () => {
        log('checking-for-update')
    })

    autoUpdater.on('update-available', () => {
        log('update-available; downloading...')
    })

    autoUpdater.on('update-not-available', () => {
        log('update-not-available')
    })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            message: process.platform === 'win32' ? releaseNotes : releaseName,
            detail:
                'A new version has been downloaded. Restart the application to apply the updates.',
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    })
}

configureAutomaticUpdates()


// Parse arguments.
console.log(process.argv);
// TODO: configure local ipfs node.
// yargs
//     .option('ipfs-node', {
//         description
//     })


//
// Configure app.
//

app.setLoginItemSettings({
    // openAtLogin: true,
    openAsHidden: true, // macOS-only.
    // TODO: we need to add additional settings for auto-update on windows.
});

// The UI is contained in ui/.
// It is built with Next.js, and must be compiled separately.
// This must be run 1st, before the app is started, otherwise we get the error:
// (node:28931) UnhandledPromiseRejectionWarning: Error: protocol.registerSchemesAsPrivileged should be called before app is ready
serve({
    directory: __dirname + '/../../ui/out/',
});

app.whenReady().then(() => {
    // createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

async function setupIpfs() {
    const gatewayOptions = {};

    // mock until I've got yargs in.
    const argv = {}
    if (argv['ipfs-node']) {
        gatewayOptions.ipfsNodeURL = arguments_['ipfs-node'];
    } else {
        // Start local IPFS node.
        // const appPath = app.getAppPath()
        const appPath = app.getAppPath().replace('app.asar', 'app.asar.unpacked')
        const ipfsBinaryPath = path.join(appPath, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        // let ipfsPath
        // if (electronIsDev) {
        //     ipfsPath = path.join(appPath, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        // } else {
        //     ipfsPath = path.join(asarUnpackedPath, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        // }

        console.log(`appPath`, app.getAppPath())
        console.log('execPath', process.execPath);
        console.log(`ipfsPath`, ipfsBinaryPath);

        // The userData directory is like:
        // macOS: ~/Library/Application Support/Dappnet/
        // Linux: ~/.config/Dappnet
        // Windows: %APPDATA%\Dappnet
        const userDataDir = app.getPath('appData')
        // Location of the ipfs data directory, which is ordinarily ~/.ipfs.
        const IPFS_PATH = path.join(userDataDir, '/.ipfs/')
        const IPFS_CONFIG_PATH = join(IPFS_PATH, '/config')
        const env = { IPFS_PATH }
        
        console.log(`IPFS_PATH`, IPFS_PATH)
        console.log(`IPFS_CONFIG_PATH`, IPFS_CONFIG_PATH)

        if (!existsSync(IPFS_CONFIG_PATH)) {
            console.log(`IPFS: no config, initializing the node`)

            // Initialize IPFS, creating a config file.
            spawnSync(ipfsBinaryPath, [`init`], { env, stdio: 'inherit' })
            
            // Sanity check it worked.
            if (!existsSync(IPFS_CONFIG_PATH)) {
                throw new Error("IPFS config was not generated after running `ipfs init`, meaning something went wrong.")
            }

            // Now add custom peers (ie. Cloudflare) to make it fast.
            // See: https://docs.ipfs.tech/how-to/peering-with-content-providers/#content-provider-list
            // NOTE: `Peers` config option is NOT supported by the js-ipfs node.
            const ipfsConfig = JSON.parse(readFileSync(IPFS_CONFIG_PATH, { encoding: "utf-8" }))
            
            let existingPeers = _.get(ipfsConfig, "Peering.Peers", [])
            if(existingPeers == null) {
                // FFS, why couldn't they just set this to an empty array?
                existingPeers = []
            }

            const peers = 
            _.set(
                ipfsConfig,
                "Peering.Peers",
                [...existingPeers, ...ipfsConfigForFastTeens.Peering.Peers]
            )

            // Write out the new config.
            writeFileSync(IPFS_CONFIG_PATH, JSON.stringify(ipfsConfig, null, 2))

            console.log(`IPFS: initialization done`)
        }

        const run = (cmd, args) => {
            const ipfs = spawn(
                cmd,
                args.split(' '),
                { env, stdio: 'inherit' }
            );

            // ipfs.stdout.on('data', (data) => {
            //     console.log(`[${cmd}] ${data}`);
            // });

            // ipfs.stderr.on('data', (data) => {
            //     console.error(`[${cmd}] ${data}`);
            // });

            ipfs.on('close', (code) => {
                if (code !== 0) {
                    console.log(`[${cmd}] process exited with code ${code}`);
                }
            });
        }

        console.log(`IPFS: starting the daemon`)
        run(ipfsBinaryPath, `daemon --stream-channels --enable-namesys-pubsub --enable-gc --manage-fdlimit`)
    }

    const enableLocalIpfsNode = false;
    if (enableLocalIpfsNode) {
        // Launch the IPFS node.
        const ipfsNode = await IPFSCore.create({
            start: true,
            // config: {
            //     // https://docs.ipfs.tech/how-to/peering-with-content-providers/#content-provider-list
            //     // Bootstrap: [
            //     //     "/dnsaddr/node-8.ingress.cloudflare-ipfs.com",
            //     //     "/dns/cluster0.fsn.dwebops.pub",
            //     //     "/ip4/139.178.68.217/tcp/6744"
            //     // ]
            // },
            EXPERIMENTAL: {
                ipnsPubsub: true,
            },
        });
        const id = await ipfsNode.id();
        console.log(id);

        // const ipfsPath = "/ipfs/QmTau1nKy3axaPKU866BWkf8CfaiKrMYWXC5sVUVpJRSgW/"
        // async function thing() {
        //     const ipfsPath = "QmTau1nKy3axaPKU866BWkf8CfaiKrMYWXC5sVUVpJRSgW"
        //     for await (const chunk of ipfsNode.get(ipfsPath)) {
        //         console.info('c', chunk)
        //     }
        // }
        // thing()

        gatewayOptions.ipfsNode = ipfsNode;
    }

    const enableLocalIpfsHttpClient = true;
    if (enableLocalIpfsHttpClient) {
        const ipfsNode = IPFSHttpClient.create({
            url: 'http://127.0.0.1:5001',
        });
        gatewayOptions.ipfsNode = ipfsNode;
        gatewayOptions.ipfsNodeURL = 'http://localhost:5001';
    }

    return {gatewayOptions};
}

async function createWindow() {
    // const appIcon = new Tray(__dirname + '/../build/icon.png')
    // const icon = nativeImage.createFromPath(__dirname + '/../build/icon.icns')
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Dappnet',
        // icon,
        icon: __dirname + '/../build/icon.icns',
        focusable: true,
        webPreferences: {
            preload: path.join(__dirname, 'ipc-renderer.js'),
        },
    });

    // Open URL's (.eth apps) in the system's web browser.
    mainWindow.webContents.on('will-navigate', function(event, url) {
        console.log(url);
        event.preventDefault();
        shell.openExternal(url);
    });

    // Setup the IPFS node.
    const {gatewayOptions} = await setupIpfs();

    // Launch the .eth/IPFS gateway.
    const ensGateway = LocalGateway.start(gatewayOptions);

    // Launch SOCKS5 proxy server.
    const socksServer = LocalSocksProxy.start();

    if (process.env.UI_DEV) {
        await mainWindow.loadURL('http://localhost:3000');
    } else {
        // Load static assets from `serve`.
        await mainWindow.loadURL('app://-');
    }

    // Open the DevTools.
    // if (isDev) {
    //     win.webContents.openDevTools({ mode: 'detach' });
    // }
}


