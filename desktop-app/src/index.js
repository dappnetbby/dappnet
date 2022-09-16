import * as sourceMap from 'source-map-support';
sourceMap.install();
import * as path from 'node:path';
import {spawn} from 'node:child_process';

import {app, BrowserWindow, shell} from 'electron';
import electronIsDev from 'electron-is-dev';
import serve from 'electron-serve';
import * as argsParser from 'simple-args-parser';
import * as IPFSHttpClient from 'ipfs-http-client';

import {setupMainProcessIPC} from './ipc-main';

import * as LocalGateway from '@dappnet/local-gateway';
import * as LocalSocksProxy from '@dappnet/local-socks5-proxy';

// Configure auto-updates.
// const { autoUpdater } = require("electron-updater")

// Parse arguments.
// TODO: this doesn't work when the args are missing.
console.log(process.argv);
const arguments_ = argsParser.parse(process.argv, {
    long: ['ipfs-node:'],
    errOnDisallowed: false,
}, (error) => {
    console.log(error);
});
console.log('args', arguments_);


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
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            // createWindow();
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

    if (arguments_['ipfs-node']) {
        gatewayOptions.ipfsNodeURL = arguments_['ipfs-node'];
    } else {
        // Start local IPFS node.
        const appPath = app.getAppPath()
        const asarUnpackedPath = app.getAppPath().replace('app.asar', 'app.asar.unpacked')
        let ipfsPath
        if (electronIsDev) {
            ipfsPath = path.join(appPath, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        } else {
            ipfsPath = path.join(asarUnpackedPath, `/vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`)
        }

        console.log(`appPath`, app.getAppPath())
        console.log('execPath', process.execPath);
        console.log(`ipfsPath`, ipfsPath);

        const ipfs = spawn(ipfsPath, [...`daemon --stream-channels --enable-namesys-pubsub --enable-gc --manage-fdlimit`.split(' ')]);

        ipfs.stdout.on('data', (data) => {
            console.log(`[ipfs] ${data}`);
        });

        ipfs.stderr.on('data', (data) => {
            console.error(`[ipfs] ${data}`);
        });

        ipfs.on('close', (code) => {
            if (code !== 0) {
                console.log(`ipfs process exited with code ${code}`);
            }
        });
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
    setupMainProcessIPC();

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


