const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const { shell } = require('electron');
const path = require('path')

const { setupMainProcessIPC } = require('./ipc-main')

const serve = require('electron-serve');

serve({ 
    directory: __dirname + '/../ui/out/'
});

const { autoUpdater } = require("electron-updater")


const createWindow = () => {
    setupMainProcessIPC()

    autoUpdater.checkForUpdatesAndNotify()

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: "Dappnet",
        focusable: true,
        webPreferences: {
            preload: path.join(__dirname, 'ipc-renderer.js')
        }
    });

    // Open all URL's (.eth apps) in the system's web browser.
    mainWindow.webContents.on('will-navigate', function (e, url) {
        console.log(url)
        e.preventDefault();
        shell.openExternal(url);
    });

    async function main() {
        // Launch .eth proxy server.
        // let ensServer = require('../../local-gateway/src/index').start()
        const gatewayOpts = {}
        if(isDev) {
            gatewayOpts.ipfsNode = "http://localhost:8080"
        }
        let ensServer = require('@dappnet/local-gateway').start(gatewayOpts)

        // Launch SOCKS5 proxy server.
        // let socksServer = require('../../local-socks5-proxy/proxy').start()
        let socksServer = require('@dappnet/local-socks5-proxy').start()

        let logs = ''
        function log(txt) {
            logs += txt + '\n'
        }

        log('dappnet')
        log('')
        log('ENS server running')
        log('SOCKS server running')

        // await loadURL(mainWindow);

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
