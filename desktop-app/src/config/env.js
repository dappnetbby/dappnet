
// Environment variables.
let {
    DEV_IPFS,
    DEV_UI,
    DEV_GATEWAY,
    OPEN_IN_DEFAULT_BROWSER
} = process.env

// Production mode.
// Sanity-check.
if (process.env.NODE_ENV == 'production') {
    DEV_IPFS = false
    DEV_UI = false
    DEV_GATEWAY = false
}

const env = {
    // Disable to start the embedded IPFS binary.
    DEV_IPFS,
    // Disable to start the embedded UI.
    DEV_UI,
    // Disable to start the embedded gateway.
    DEV_GATEWAY,
    // Open links in the default browser instead of the embedded browser.
    OPEN_IN_DEFAULT_BROWSER,
}


export { env }