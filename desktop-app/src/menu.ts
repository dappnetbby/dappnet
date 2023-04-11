import { Menu, app } from "electron"
import telemetry from './telemetry'
const isMac = process.platform === 'darwin'

const template = [
    // { role: 'appMenu' }
    ...(isMac ? [{
        label: 'Dappnet',
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' }, 
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }] : []),

    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },

    // {
    //     label: 'Browser',
    //     submenu: [
    //         {
    //             // a simple checkbox item to enable/disable telemetry.
    //             label: 'Chrome',
    //             type: 'checkbox',
    //             checked: telemetry.enabled,
    //             click: (menuItem: any, browserWindow: any, event: any) => {
    //                 const { checked: enabled } = menuItem
    //                 telemetry.log('desktop-app', 'telemetry-setting', { enabled })
    //                 telemetry.store.set("telemetryEnabled", enabled)
    //             }
    //         }
    //     ]
    // },

    {
        label: 'Options',
        submenu: [
            {
                // a simple checkbox item to enable/disable telemetry.
                label: 'Enable Telemetry',
                type: 'checkbox',
                checked: telemetry.enabled,
                click: (menuItem: any, browserWindow: any, event: any) => {
                    const { checked: enabled } = menuItem
                    telemetry.log('desktop-app', 'telemetry-setting', { enabled })
                    telemetry.store.set("telemetryEnabled", enabled)
                }
            }
        ]
    },

    // { role: 'editMenu' }
    // {
    //     label: 'Edit',
    //     submenu: [
    //         { role: 'undo' },
    //         { role: 'redo' },
    //         { type: 'separator' },
    //         { role: 'cut' },
    //         { role: 'copy' },
    //         { role: 'paste' },
    //         ...(isMac ? [
    //             { role: 'pasteAndMatchStyle' },
    //             { role: 'delete' },
    //             { role: 'selectAll' },
    //             { type: 'separator' },
    //             {
    //                 label: 'Speech',
    //                 submenu: [
    //                     { role: 'startSpeaking' },
    //                     { role: 'stopSpeaking' }
    //                 ]
    //             }
    //         ] : [
    //             { role: 'delete' },
    //             { type: 'separator' },
    //             { role: 'selectAll' }
    //         ])
    //     ]
    // },
    // { role: 'viewMenu' }
    // {
    //     label: 'View',
    //     submenu: [
    //         // { role: 'reload' },
    //         // { role: 'forceReload' },
    //         // { role: 'toggleDevTools' },
    //         // { type: 'separator' },
    //         // { role: 'resetZoom' },
    //         // { role: 'zoomIn' },
    //         // { role: 'zoomOut' },
    //         // { type: 'separator' },
    //         // { role: 'togglefullscreen' }
    //     ]
    // },
    // { role: 'windowMenu' }
    // {
    //     label: 'Window',
    //     submenu: [
    //         { role: 'minimize' },
    //         { role: 'zoom' },
    //         ...(isMac ? [
    //             { type: 'separator' },
    //             { role: 'front' },
    //             { type: 'separator' },
    //             { role: 'window' }
    //         ] : [
    //             { role: 'close' }
    //         ])
    //     ]
    // },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://liamzebedee.gitbook.io/dappnet/')
                }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(template as any)
Menu.setApplicationMenu(menu)

export {
    menu
}