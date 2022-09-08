const { contextBridge, ipcRenderer } = require('electron')

// Electron apps are split into a main process (Node.js environment) and a renderer process (web environment).
// The context bridge allows us to perform IPC between them.
// This file is loaded into the renderer process.

const ipcMethods = [
    'statusCheck',
    'installCA'
]

function setupRendererProcessIPC() {
    const api = ipcMethods
        .map(methodName => {
            return {
                [methodName]: function() {
                    return ipcRenderer.invoke(`main:${methodName}`, ...arguments)
                }
            }
        })
        .reduce((prev, curr) => Object.assign(prev, curr), {})

    console.log(`IPC renderer API:`, api)
    contextBridge.exposeInMainWorld('electronMain', api)
}

setupRendererProcessIPC()