
// Environment variables.
const {
    DEV_IPFS,
    DEV_UI,
    DEV_GATEWAY,
    OPEN_IN_DEFAULT_BROWSER
} = process.env

export const env = {
    DEV_IPFS,
    DEV_UI,
    DEV_GATEWAY,
    
    OPEN_IN_DEFAULT_BROWSER
}

// Feature flags.
export const EMBEDDED_BROWSER = false
export const EMBEDDED_ETHEREUM_NODE = false
export const EMBEDDED_WALLET = false

export let featureFlags = {
    EMBEDDED_BROWSER,
    EMBEDDED_ETHEREUM_NODE,
    EMBEDDED_WALLET
}

if(process.env.NODE_ENV == 'production') {
    DEV_IPFS = false
    DEV_UI = false
    DEV_GATEWAY = false

    featureFlags = {
        EMBEDDED_BROWSER: false,
        EMBEDDED_ETHEREUM_NODE: false,
        EMBEDDED_WALLET: false
    }
}