// Feature flags.
let featureFlags = {
    EMBEDDED_BROWSER: true,
    EMBEDDED_ETHEREUM_NODE: true,
    EMBEDDED_WALLET: true
}

// Production mode.
if (process.env.NODE_ENV == 'production') {
    featureFlags = {
        EMBEDDED_BROWSER: false,
        EMBEDDED_ETHEREUM_NODE: false,
        EMBEDDED_WALLET: false
    }
}

export { featureFlags }