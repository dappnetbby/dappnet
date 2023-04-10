import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk'
import { app } from 'electron'
import node_os from 'node:os'

import Store from 'electron-store'
const store = new Store({ name: 'telemetry' });



const getAppVersion = () => {
    return app.getVersion()
}

const GA_UUID_KEY_NAME = 'ga_uuid';

export const getClientId = () => {
    let uuid = store.get(GA_UUID_KEY_NAME);
    if (uuid == null) {
        uuid = uuidv4();
        store.set(GA_UUID_KEY_NAME, uuid);
    }
    return uuid as string;
};

export const deleteUuid = () => {
    store.delete(GA_UUID_KEY_NAME);
}




const log = function (...args: any[]) {
    console.log(chalk.yellow(`[telemetry]`), chalk.gray(...args))
}


export let clientInfo = {
    clientId: "",
    os: node_os.platform(),
    osVersion: node_os.release(),
    arch: node_os.arch(),
    appVersion: getAppVersion(),
}

if (store.get("telemetryEnabled") == null) {
    store.set("telemetryEnabled", true)
}
const isEnabled = () => {
    if(process.env.NODE_ENV == 'development') return false
    const pref = store.get("telemetryEnabled") as boolean
    return pref
}
const enabled = isEnabled() 

export function configure() {
    log(`Telemetry enabled: ${enabled}`)

    clientInfo.clientId = getClientId()

    // Log some basic info
    log(`Client-Id`, clientInfo.clientId)
    log(`OS`, clientInfo.os)
    log(`OS Version`, clientInfo.osVersion)
    log(`Arch`, clientInfo.arch)
    log(`App Version`, clientInfo.appVersion)
}


export const telemetryLog = async (source: string, event: string, args: any) => {
    if (!enabled) return

    log(`${source} ${event} ${JSON.stringify(args)}`)

    const baseUrl = `https://dappnet-telemetry.vercel.app/api/v1/events`

    // Add user agent to args
    args = {
        ...args,
        clientInfo,
    }
    
    try {
        const res = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source,
                event,
                args
            }),
        })
        
    } catch(err) {
        // We may not be connected to the internet. Who cares.
        log(chalk.red(`error:`, err))
    }
}


const telemetry = {
    clientInfo,
    configure,
    log: telemetryLog,
    store: store,
    enabled
}
export default telemetry