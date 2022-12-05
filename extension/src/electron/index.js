const { config } = require('../common')
const _ = require('lodash')


// run script when a request is about to occur
chrome.webRequest.onBeforeRequest.addListener(function (details) {
    const url = new URL(details.url)

    // Make sure the domain ends with .eth.
    const tld = url.hostname.slice(-3);
    if (tld != 'eth') {
        return;
    }

    // Automatically redirect http:// to https:// URL's for .eth domains.
    if (url.protocol == 'http:') {
        url.protocol = 'https:'
        return {
            redirectUrl: url.toString()
        }
    }

    // Check if the gateway is up.
    // try {
    // 	await fetch(`http://127.0.0.1:6801`)
    // } catch(err) {
    // 	console.debug(err)
    // }

    const host = url.hostname;

    // Generate a dynamic PAC script per-host.
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Proxy_servers_and_tunneling/Proxy_Auto-Configuration_PAC_file
    const proxy = `SOCKS5 ${config.socksProxy.host}:${config.socksProxy.port}`
    const pacScript = `function FindProxyForURL(url, host) {
			if (dnsDomainIs(host, "${host}")) {
				return "${proxy}";
			}
			return "DIRECT";
		}`
    // console.log(pacScript)

    const proxyConfig = {
        mode: "pac_script",
        pacScript: {
            data: pacScript
        }
    };

    chrome.proxy.settings.set(
        { value: proxyConfig, scope: 'regular' },
        function () { }
    );

    return;


}, { urls: ["<all_urls>"] }, ["blocking"]);