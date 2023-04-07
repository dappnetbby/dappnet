import * as sourceMap from 'source-map-support';
sourceMap.install();
import * as path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';

import {app, BrowserWindow, ipcMain, MessageChannelMain, shell} from 'electron';
import electronIsDev from 'electron-is-dev';
import serve from 'electron-serve';

import { copyFileSync, cpSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as _ from 'lodash'
import { ipfsConfigForFastTeens } from './ipfs-configs/ipfs';
import * as yargs from 'yargs'
import { dialog, autoUpdater, session } from 'electron';
import { app } from 'electron'
import { execPath } from 'node:process';
import chalk from 'chalk'
import { fork } from 'child_process'


import {
    Worker, isMainThread, parentPort, workerData,
} from "node:worker_threads"

const { featureFlags, env } = require("./config")
import telemetry from './telemetry'
import { ServiceLoggerStream } from './utils';


// 
// Print a banner on startup.
// 

function printBanner() {
    console.log(chalk.blueBright(`Dappnet v${app.getVersion()}`))
    console.log(chalk.blue(`Do what you think is great work.`))
    console.log(``)
    console.log(``)
}


// 
// Configure automatic updates.
//

function configureAutomaticUpdates() {
    const repo = 'liamzebedee/dappnet'
    const updateServerBase = 'https://dappnet-update-server-pi.vercel.app'
    const updateServerUrl = `${updateServerBase}/update/${process.platform}/${app.getVersion()}`
    // const updateManifestLocation = 'https://raw.githubusercontent.com/gliss-co/undisclosed/master/___________'
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

    console.log(`updateServerUrl: ${updateServerUrl}`)

    autoUpdater.setFeedURL({
        // url: "file:///Users/liamz/Documents/Projects/dappnet/desktop-app/test/auto-update/update.json"
        url: updateServerUrl
    })
    
    if (app.isPackaged) {
        setInterval(() => {
            autoUpdater.checkForUpdates()
        }, 60000)
    } else {
        // Leave for testing:
        // autoUpdater.checkForUpdates()
    }

    const log = function() {
        console.log(chalk.yellow(`[updater]`), chalk.gray(...arguments))
    }

    autoUpdater.on('error', function () {
        log(chalk.red(arguments))
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

    // autoUpdater.on('download-progress', (ev, progressObj) => {
    //     log('download-progress', `${progressObj.percent}%`)
    // })

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        telemetry.log('desktop-app', 'update-downloaded', { time: Date.now(), releaseName })
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


// 
// Parse arguments.
// 

function parseArguments() {
    console.log(chalk.gray(process.argv.join(', ')))
    console.log()

    // require('yargs')
    //     .scriptName("dappnet")
    //     .usage('$0 <cmd> [args]')
    //     .command('deploy', 'deploy the dir', (yargs) => {
    //         yargs
    //             .option('dir', {
    //                 type: 'string',
    //                 describe: 'the directory to publish'
    //             })
    //             .option('ipfs-node', {
    //                 type: 'string',
    //                 describe: 'the URL to the IPFS node we are using to publish.',
    //                 default: "http://localhost:5001/api/v0"
    //             })
    //             .option('ipns', {
    //                 type: 'string',
    //                 describe: 'Update an IPNS name. The private key should be set in the environment variable, DAPPNET_IPNS_KEY.'
    //             })
    //             .demandOption(['dir', 'ipns'], '')
    //     }, deploy)
    //     .help()
    //     .argv

    // TODO: configure local ipfs node.
}

//
// Configure app.
//

function configureApp() {
    app.setLoginItemSettings({
        // openAtLogin: true,
        openAsHidden: true, // macOS-only.
        // TODO: we need to add additional settings for auto-update on windows.
    });
    app.enableSandbox()
    
    // Setup dappnet:// URI scheme.
    // 
    const dappnetProtocol = `dappnet`
    if (process.defaultApp) {
        if (process.argv.length >= 2) {
            app.setAsDefaultProtocolClient(dappnetProtocol, process.execPath, [path.resolve(process.argv[1])])
        }
    } else {
        app.setAsDefaultProtocolClient(dappnetProtocol)
    }
}


function serveUI() {
    // The UI is contained in ui/.
    // It is built with Next.js, and must be compiled separately.
    // This must be run 1st, before the app is started, otherwise we get the error:
    // (node:28931) UnhandledPromiseRejectionWarning: Error: protocol.registerSchemesAsPrivileged should be called before app is ready
    serve({
        directory: __dirname + '/../../ui/out/',
    });
}

function setupExtension() {
    // Load extension into the Electron context.
    // NOTE: doesn't work.
    try {
        // const dappnetExtension = await session.defaultSession.loadExtension('/Users/liamz/Documents/Projects/dappnet/extension/build/chrome')
        // const dappnetExtension = await session.defaultSession.loadExtension('/Users/liamz/Documents/Projects/dappnet/preload/dist')
    } catch (err) {
        console.error(err)
    }
}

let processes = []

function startGateway() {
    const appPath = app.getAppPath()
    const appDataPath = app.getPath('appData')

    const program3 = fork(path.join(__dirname, 'services/ipfs.js'), ['args'], {
        stdio: 'pipe',
        env: {
            APP_PATH: appPath,
            APP_DATA_PATH: appDataPath,
            DEV_IPFS: env.DEV_IPFS,
            FORCE_COLOR: true
        }
    });
    processes.push(program3)

    program3.stdout.pipe(process.stdout);
    program3.stderr.pipe(process.stderr);



    const program2 = fork(path.join(__dirname, 'services/proxy.js'), ['args'], {
        stdio: 'pipe',
        env: {
            APP_PATH: appPath,
            APP_DATA_PATH: appDataPath,
            FORCE_COLOR: true
        }
    });
    processes.push(program2)

    program2.stdout.pipe(process.stdout);
    program2.stderr.pipe(process.stderr);


    if (env.DEV_GATEWAY) {
        console.debug('[dev] using local gateway')
        return
    }

    const program1 = fork(path.join(__dirname, 'services/gateway.js'), ['args'], {
        stdio: 'pipe',
        env: {
            APP_PATH: appPath,
            APP_DATA_PATH: appDataPath,
            FORCE_COLOR: true,
            DATA: JSON.stringify({
                telemetry: {
                    clientInfo: telemetry.clientInfo,
                    TELEMETRY_ENABLED: env.TELEMETRY_ENABLED,
                }
            })
        }
    });
    processes.push(program1)

    program1.stdout.pipe(process.stdout);
    program1.stderr.pipe(process.stderr);

}

function startWallet() {
    let walletWorkerCounter = 1
    const generateWalletWorkerMessageId = () => walletWorkerCounter++
    const walletWorkerCbs = {}
    
    // Start wallet worker.
    const walletWorker = require('./wallet/wallet')()

    // Await a reply.
    walletWorker.on('message', (msg) => {
        const { id, res } = msg
        walletWorkerCbs[id](res)
    })

    ipcMain.handle('ethereum-request()', async function (_, argsStr) {
        return new Promise((resolve, rej) => {
            // Generate a unique id for this request.
            const id = generateWalletWorkerMessageId()

            // Setup a handler for the reply.
            walletWorkerCbs[id] = (res) => {
                resolve(res)
                delete walletWorkerCbs[id]
            }

            // Forward to the wallet worker.
            walletWorker.postMessage({ argsStr, id })
        })
    })
}

function fixInjectedEthereumObject(window) {
    // Then we inject a script which proxies the window.ethereum object to the dappnetProvider object:
    // This is because window.ethereum needs to be mutable, because some dapps (Uniswap) fuck with it.
    window.webContents.executeJavaScript(`
        window.ethereum = dappnetProvider
    `)
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
            nodeIntegrationInWorker: true,
            // https://stackoverflow.com/questions/58653223/why-does-preload-js-return-error-module-not-found
            preload: path.join(__dirname, 'preload.js'),
        }

        // frame: false, titleBarStyle: 'hidden',
        // titleBarOverlay: true
        // movable: true,
    });

    // Detect last exit and send this event to the server.
    const lastExit = telemetry.store.get("lastExit")
    if (lastExit) {
        telemetry.log('desktop-app', 'close', { time: lastExit })
        telemetry.store.delete("lastExit")
    }
    telemetry.log('desktop-app', 'open', { time: Date.now() })


    if(featureFlags.EMBEDDED_WALLET) {
        fixInjectedEthereumObject(mainWindow)
    }


    // Loading indicator.
    const APP_NAME = 'Dappnet'
    mainWindow.webContents.on('did-start-loading', () => {
        mainWindow.setTitle(APP_NAME + '- loading...');    
    });
    mainWindow.webContents.on('did-stop-loading', () => {
        mainWindow.setTitle(APP_NAME);
        mainWindow.setProgressBar(-1);
    });


    // 
    // Setup handlers for .eth domains, and dappnet:// URIs.
    // 
    
    // Forward all connections to the local gateway.
    await session.defaultSession.setProxy({
        proxyRules: 'socks5://localhost:6801'
    })
    
    // Handle when a user opens/clicks dappnet://uniswap.eth, and route it to https://uniswap.eth in our client.
    app.on('open-url', async (event, url) => {
        // Parse the URL.
        const parsedUrl = new URL(url)

        const httpsUrl = url.replace('dappnet://', 'https://')
        try {
            // Open in current window.
            // await mainWindow.loadURL(httpsUrl)

            // Open in a new window
            // Execute this JS in the mainWindow, so we don't have to rewrite all of the settings.
            const newWindow = await mainWindow.webContents.executeJavaScript(`window.open('${httpsUrl}')`)
        } catch (err) {
            console.error(err)
        }

        // Write the auth flag.
        // const userDataDir = app.getPath('userData')
        // const dappnetLicenseFile = join(userDataDir, '/bueno')
        // console.log(dappnetLicenseFile)
        // writeFileSync(dappnetLicenseFile, 'true')
    })

    if(featureFlags.EMBEDDED_BROWSER) {
        // New windows should look different to the main Dappnet window.
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            telemetry.log('desktop-app', 'launch-dapp', { time: Date.now(), url })
            
            return {
                action: 'allow',
                outlivesOpener: true,
                overrideBrowserWindowOptions: {
                    // frame: false,
                    width: 1000,
                    height: 800,
                    title: url,
                    // focusable: true,
                    // parent: null,
                    modal: false,
    
                    // fullscreenable: false,
                    // autoHideMenuBar: false,
                    webPreferences: {
                        nodeIntegrationInWorker: true,
                        preload: path.join(__dirname, 'preload.js'),
                    }
                }
            }
        })
    } else {
        const openInSystemBrowser = (url) => {
            console.log(url);

            // Open in the default browser.
            if (env.OPEN_IN_DEFAULT_BROWSER) {
                shell.openExternal(url);
                return
            }

            // Open in Chrome.
            // By using -a, the Chrome logo does not pop up in the dock.
            const application = 'open'
            const args = ['-a', "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", url]
            const options = {
                detached: true,
                stdio: 'ignore'
            }
            const child = spawn(application, args, options)
            child.unref()
        }
        mainWindow.webContents.setWindowOpenHandler(({ url }) => {
            openInSystemBrowser(url)
        })
        // Open URL's (.eth apps) in the system's web browser.
        mainWindow.webContents.on('will-navigate', function (event, url) {
            telemetry.log('desktop-app', 'launch-dapp', { time: Date.now(), url })

            event.preventDefault();
            openInSystemBrowser(url)
        });
    }


    if (env.DEV_UI) {
        console.debug('[dev] using local dappnet UI')
        await mainWindow.loadURL('http://localhost:3000');
        // await mainWindow.loadURL('app://-');
        // await mainWindow.loadURL('https://app.uniswap.org');
    } else {
        // Load static assets from `serve`.
        await mainWindow.loadURL('app://-');
        // await mainWindow.loadURL('https://dappnet-install-point.vercel.app/');
    }

    // Open the DevTools.
    // if (isDev) {
    //     win.webContents.openDevTools({ mode: 'detach' });
    // }
}

function fixDappnetDataLocation() {
    // Copy /Applications/Dappnet/data to ~/Library/Application Support/Dappnet/data
    const appDataDir = app.getPath('appData')
    const dappnetDataDir = join(appDataDir, '/Dappnet/data')
    
    const dappnetDataDirExists = existsSync(dappnetDataDir)
    if (!dappnetDataDirExists) {
        console.log('Copying Dappnet data directory to ~/Library/Application Support/Dappnet/data')
        const dappnetDataDirSource = `/Applications/Dappnet.app/data`

        // Copy each file in dir.
        const files = readdirSync(dappnetDataDirSource)
        files.forEach(file => {
            const source = join(dappnetDataDirSource, file)
            const dest = join(dappnetDataDir, file)
            cpSync(source, dest)
        })
    }
}

fixDappnetDataLocation()
printBanner()
parseArguments()
telemetry.configure()
configureAutomaticUpdates()
configureApp()
serveUI()
startGateway()

if (featureFlags.EMBEDDED_WALLET) {
    startWallet()
}

app.whenReady().then(() => {
    // setupExtension()
    createWindow()

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

app.on('will-quit', () => {
    telemetry.store.set("lastExit", Date.now())
})

// Add a handler for when the process is exiting.
process.on('exit', function () {
    processes.forEach(function (proc) {
        proc.kill();
    });
})