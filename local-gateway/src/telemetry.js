const fetch = require('node-fetch')
const chalk = require('chalk')

const log = function (...x) {
    console.log(chalk.yellow(`[telemetry]`), chalk.gray(...arguments))
}

let clientInfo = null

let TELEMETRY_ENABLED = false
function configure(config) {
    clientInfo = config.clientInfo
    TELEMETRY_ENABLED = config.TELEMETRY_ENABLED

    // Log some basic info
    log(`Client-Id`, clientInfo.clientId)
    log(`OS`, clientInfo.os)
    log(`OS Version`, clientInfo.osVersion)
    log(`Arch`, clientInfo.arch)
    log(`App Version`, clientInfo.appVersion)
}

const telemetryLog = async (source, event, args) => {
    if (!TELEMETRY_ENABLED) return
    if (!clientInfo.clientId) throw new Error("Telemetry - client ID not configured")

    log(`${source} ${event} ${JSON.stringify(args)}`)
    // return

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

    } catch (err) {
        // We may not be connected to the internet. Who cares.
        log(chalk.red(`error:`, err))
    }
}


const telemetry = {
    configure,
    log: telemetryLog,
}

module.exports = telemetry