
const { contextBridge, ipcRenderer } = require('electron')

const ethereum = {
    isMetaMask: true,
    // selectedAddress: '0x1234567890123456789012345678901234567890',
    selectedAddress: null,
    networkVersion: '1',
    chainId: '0x1',
    on: () => {},
    removeListener: () => {},
    request: function () {
        // convert arguments to an array
        const argsArray = Array.prototype.slice.call(arguments)
        console.log(`ethereum-request(`, argsArray, `)`)
        const argsStr = JSON.stringify(argsArray)
        return ipcRenderer.invoke('ethereum-request()', argsStr)
    },
    send: () => {
        return new Promise()
    },
    sendAsync: () => {
        return new Promise()
    },
    // autoRefreshOnNetworkChange: false,
    enable: () => {
        return true
    },
};

contextBridge.exposeInMainWorld('dappnetProvider', ethereum)
contextBridge.exposeInMainWorld('ethereum', ethereum)


