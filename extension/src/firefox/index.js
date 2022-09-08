const { config } = require('../common')

browser.proxy.onError.addListener(newState => {
    console.error("Error with proxy:", newState)
})

browser.proxy.onRequest.addListener(
    (details) => {
        // get the parts of the url (hostname, port) by creating an 'a' element
        const parser = document.createElement('a');
        parser.href = details.url;

        // Make sure the domain ends with .eth.
        const tld = parser.hostname.slice(-3);
        console.log(tld)
        if (tld != 'eth') {
            return { type: "direct" };
        }

        // Firefox: not possible to redirect to HTTPS in the extension :(
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/proxy/onRequest

        // let proxyInfo = {
        //     type: 'http',
        //     host: 'localhost',
        //     port: PROXY_PORT_HTTP
        // }

        let proxyInfo = {
            type: 'socks',
            host: config.socksProxy.host,
            port: config.socksProxy.port,
            // ProxyDNS is needed in Firefox, set automatically in Chrome (I think)
            proxyDNS: true
        }
        return proxyInfo
    },
    { urls: ["<all_urls>"] },
    [ "requestHeaders" ]
)


// UI

// browser.browserAction.onClicked.addListener(() => {
//     browser.browserAction.setBadgeBackgroundColor({ color: "transparent" });
// });
