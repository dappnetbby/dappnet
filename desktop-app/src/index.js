const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const { shell } = require('electron');
const path = require('path')

const { setupMainProcessIPC } = require('./ipc-main')

const serve = require('electron-serve');

serve({ 
    directory: __dirname + '/../ui/out/'
});

// const { autoUpdater } = require("electron-updater")
const argsParser = require('simple-args-parser');
const { spawn } = require('child_process');
const electronIsDev = require('electron-is-dev');

const createWindow = () => {
    setupMainProcessIPC()

    app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true, // macOS-only.
        // TODO: we need to add additional settings for auto-update on windows.
    })

    // TODO: this doesn't work when the args are missing.
    console.log(process.argv)
    const args = argsParser.parse(process.argv, {
        long: ['ipfs-node:'],
        errOnDisallowed: false
    }, (err) => {
        console.log(err)
    })
    console.log('args', args)


    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Dappnet",
        focusable: true,
        webPreferences: {
            preload: path.join(__dirname, 'ipc-renderer.js')
        }
    });

    // Open URL's (.eth apps) in the system's web browser.
    mainWindow.webContents.on('will-navigate', function (e, url) {
        console.log(url)
        e.preventDefault();
        shell.openExternal(url);
    });

    async function main() {
        const gatewayOpts = {}
        if (args['ipfs-node']) {
            gatewayOpts.ipfsNodeURL = args['ipfs-node']
        } else {
            // Start local IPFS node.
            const ipfsPath = electronIsDev
                ? path.join(app.getAppPath(), `/../vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`).replace('app.asar', 'app.asar.unpacked')
                : __dirname + `/../vendor/ipfs/go-ipfs_v0.13.0_darwin-amd64/ipfs`;
            
            console.log(ipfsPath)
            const ipfs = spawn(ipfsPath, [...`daemon --stream-channels --enable-namesys-pubsub --enable-gc --manage-fdlimit`.split(' ')])

            ipfs.stdout.on('data', (data) => {
                console.log(`[ipfs] ${data}`)
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
        
        const enableLocalIpfsNode = false
        if (enableLocalIpfsNode) {
            // Launch the IPFS node.
            const IPFS = await import('ipfs-core');
            const ipfsNode = await IPFS.create({
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
                }
            })
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

            gatewayOpts.ipfsNode = ipfsNode
        }

        const enableLocalIpfsHttpClient = true
        if (enableLocalIpfsHttpClient) {
            const IPFS = await import('ipfs-http-client');
            const ipfsNode = IPFS.create({
                url: "http://127.0.0.1:5001"
            })
            gatewayOpts.ipfsNode = ipfsNode
            gatewayOpts.ipfsNodeURL = 'http://localhost:5001'
        }

        // Launch the .eth/IPFS gateway.
        const ensGateway = require('@dappnet/local-gateway').start(gatewayOpts)

        // Launch SOCKS5 proxy server.
        const socksServer = require('@dappnet/local-socks5-proxy').start()

        let logs = ''
        function log(txt) {
            logs += txt + '\n'
        }

        log('dappnet')
        log('')
        log('ENS server running')
        log('SOCKS server running')

        if (isDev) {
            await mainWindow.loadURL('http://localhost:3000')
        } else {
            // Load static assets.
            await mainWindow.loadURL('app://-')
        }

        // await mainWindow.loadURL('app://x');
        // win.loadFile()

        // while (true) {
        //     // win.loadURL(`data:text/html,<html><pre>${logs}</pre>`);
        //     // win.loadURL('http://localhost:3000')
        //     win.loadFile(__dirname + '/../ui/out/index.html')
        //     await new Promise((res,rej) => setTimeout(res, 1000))
        // }
    }

    main()

    // Open the DevTools.
    // if (isDev) {
    //     win.webContents.openDevTools({ mode: 'detach' });
    // }
};



app.whenReady().then(() => {
    console.log('execPath', process.execPath)

    createWindow();

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
