const { config } = require('../common')

const getOptionsPageURL = () => {
	const manifest = chrome.runtime.getManifest()
	const optionsPageFilename = manifest.options_ui.page
	const url = chrome.runtime.getURL('/' + optionsPageFilename)
	return url
}

chrome.proxy.onProxyError.addListener(function (details) {
	console = chrome.extension.getBackgroundPage().console;

	console.error(details.details)
	console.error(details.error)
})

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
	console.log(pacScript)

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

	// Alternative idea I was brewing on:
	// If the user isn't able to install the Dappnet app, e.g. because their device is locked-down.
	// We can dynamically load them onto the gateway services (e.g. something.eth.link) in-browser,
	// using the extension's background page.

	// else if(featureFlag.cdn == CDN_GATEWAY) {
	// 	// const extensionURL = chrome.runtime.getURL('options.html')
	// 	const optionsPageURL = getOptionsPageURL()
	// 	const rng = +new Date
	// 	// const redirectUrl = `data:text/html,<html><body>Hello. Visit <a href='https://uniswap${rng}.eth'>uniswap.eth</a>`
	// 	const redirectUrl = `${optionsPageURL}/#/${parser.hostname}`
	// 	// const redirectUrl = `data:text/html,<script>window.location="${extensionView}"</script>`
	// 	return {
	// 		redirectUrl,
	// 	}
	// }

}, { urls: ["<all_urls>"] }, ["blocking"]);
