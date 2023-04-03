import { env } from './config'
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




const log = function (...x: any) {
    console.log(chalk.yellow(`[telemetry]`), chalk.gray(...arguments))
}


let clientInfo = {
    clientId: "",
    os: node_os.platform(),
    osVersion: node_os.release(),
    arch: node_os.arch(),
    appVersion: getAppVersion(),
}
// const userAgent = app.userAgentFallback

export function configureTelemetry() {
    clientInfo.clientId = getClientId()

    // Log some basic info
    log(`Client-Id`, clientInfo.clientId)
    log(`OS`, clientInfo.os)
    log(`OS Version`, clientInfo.osVersion)
    log(`Arch`, clientInfo.arch)
    log(`App Version`, clientInfo.appVersion)
}


export const telemetryLog = async (source: string, event: string, args: any) => {
    if (!env.TELEMETRY_ENABLED) return

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
    configure: configureTelemetry,
    log: telemetryLog,
    store: store
}
export default telemetry