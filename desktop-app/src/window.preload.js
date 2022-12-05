window.web3 = window.ethereum = {
    isMetaMask: true,
    selectedAddress: '0x1234567890123456789012345678901234567890',
    networkVersion: '1',
    chainId: '0x1',
    on: () => {},
    removeListener: () => {},
    request: () => {
        return new Promise()
    },
    send: () => {
        return new Promise()
    },
    sendAsync: () => {
        return new Promise()
    },
    autoRefreshOnNetworkChange: false,
    enable: () => {
        return true
    },
};
