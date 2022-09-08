const { ipcMethods: ipcMethodsSpec } = require('./ipc-common')
const { ipcMain } = require('electron');

const shell = require('shelljs');

// IPC methods.
function checkDappnetCA() {
    // TODO: FIX
    shell.config.execPath = shell.which('node').toString();
    return { installed: true }

    const CERT = __dirname + `/../node_modules/@dappnet/local-gateway/dev-certificates/ca.crt`
    const output = shell.exec(`sudo security verify-cert -c ${CERT}`)
    console.debug(output)
    if (output.match(/certificate verification successful/)) {
        return {
            installed: true
        }
    } else {
        return {
            installed: false,
            log: output
        }
    }
}

async function statusCheck(event, test) {
    console.log('statusCheck', test)

    const certificateCheck = checkDappnetCA()

    const setupComplete = certificateCheck.installed

    return {
        certificateCheck,
        setupComplete
    }
}

async function installCA() {
    const CERT = __dirname + `/../node_modules/@dappnet/local-gateway/dev-certificates/ca.crt`
    const output = shell.exec(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${CERT}`)
    return
}

const ipcMethods = {
    statusCheck,
    installCA
}

function setupMainProcessIPC() {
    console.log(`IPC main API:`, ipcMethods)

    Object.entries(ipcMethods)
        .map(([methodName, method]) => {
            ipcMain.handle(`main:${methodName}`, method)
        })
}

module.exports = {
    setupMainProcessIPC
}