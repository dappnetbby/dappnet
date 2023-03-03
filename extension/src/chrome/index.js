const { config } = require('../common')
const _ = require('lodash')

// const getOptionsPageURL = () => {
// 	const manifest = chrome.runtime.getManifest()
// 	const optionsPageFilename = manifest.options_ui.page
// 	const url = chrome.runtime.getURL('/' + optionsPageFilename)
// 	return url
// }

chrome.proxy.onProxyError.addListener(function (details) {
	console = chrome.extension.getBackgroundPage().console;

	console.error(details.details)
	console.error(details.error)
})

// const proxyPacScript = `
// function FindProxyForURL(url, host) {
// 	if (shExpMatch(host, '*.eth')) {
// 		return "SOCKS5 ${config.socksProxy.host}:${config.socksProxy.port}";
// 	}
// 	return "DIRECT";
// }`

// chrome.proxy.settings.set(
// 	{
// 		value: {
// 			mode: "pac_script",
// 			pacScript: {
// 				data: proxyPacScript
// 			}
// 		},
// 		scope: "regular",
// 	}, function() {}
// )

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



// run script when a request is about to occur
chrome.webRequest.onBeforeRequest.addListener(function (details) {
	const url = new URL(details.url)

	const tlds = '.eth .dappnet .ipfs'.split(' ')

	// Make sure the domain ends with .eth.
	console.log(url.hostname)

	let handledByDappnet = false
	for(let tld of tlds) {
		if (url.hostname.endsWith(tld)) handledByDappnet = true
	}
	if (!handledByDappnet) return


	// const tld = url.hostname.slice(-3);
	// if (tld != 'eth' || 'tld' != 'ipfs') {
	// 	return;
	// }

	// Automatically redirect http:// to https:// URL's for .eth domains.
	// if (url.protocol == 'http:') {
	// 	url.protocol = 'https:'
	// 	return {
	// 		redirectUrl: url.toString()
	// 	}
	// }

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
	// const pacScript = `function FindProxyForURL(url, host) {
	// 		if (dnsDomainIs(host, "${host}")) {
	// 			return "${proxy}";
	// 		}
	// 		return "DIRECT";
	// 	}`
	const pacScript = `function FindProxyForURL(url, host) {
		${tlds.map(tld => {
			return `
			if (shExpMatch(host, "*${tld}")) {
				return "${proxy}";
			}\n`
		}).join('\n')}

		return "DIRECT";
	}`
	// const pacScript = `function FindProxyForURL(url, host) {
	// 		if (dnsDomainIs(host, ".eth")) {
	// 			return "${proxy}";
	// 		}
	// 		return "DIRECT";
	// 	}`

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


}, { urls: ["<all_urls>"] }, ["blocking"]);


// run script when a request is about to occur
// chrome.webRequest.onHeadersReceived.addListener(function (details) {
// 	const url = new URL(details.url)
// 	console.log(url.href)

// 	// Make sure the domain ends with .eth.
// 	const tld = url.hostname.slice(-3);
// 	if (tld != 'eth') {
// 		return;
// 	}

// 	const { responseHeaders, requestId, timeStamp, tabId } = details
// 	// chrome.runtime.sendMessage({
// 	// 	type: 'headers',
// 	// 	url,
// 	// 	headers: responseHeaders,
// 	// 	requestId,
// 	// 	timeStamp,
// 	// 	tabId
// 	// })

// 	handleHeaders({
// 		type: 'headers',
// 		url,
// 		headers: responseHeaders,
// 		requestId,
// 		timeStamp,
// 		tabId
// 	})


// }, { urls: ["<all_urls>"] }, ["responseHeaders"]);


// chrome.runtime.onMessage.addListener(
// 	function (message, sender, sendResponse) {
// 		// console.log(sender.tab ?
// 		// 	"from a content script:" + sender.tab.url :
// 		// 	"from the extension");
// 		messageHandlers[message.type]({ message, sender, sendResponse })
// 	}
// );


// const tabStore = {}
// const messageHandlers = {
// 	// 'headers': handleHeaders,
// 	'getTabHistory': getTabHistory
// }

// function handleHeaders({ tabId, timeStamp, requestId, url, headers }) {
// 	// Extract any relevant detail from headers.
// 	let dappnetHeaders = headers
// 		.filter(({ name, value }) => {
// 			// TODO: this strictly does not handle lowercase headers, even though apparently that's spec-compliant.
// 			return name.startsWith('X-Dappnet') || name.startsWith('X-Ipfs')
// 		})
// 	dappnetHeaders = _.fromPairs(dappnetHeaders.map(({ name, value }) => ([name, value])))

// 	const tab = _.get(tabStore, tabId, [])
// 	tab.push({
// 		headers: dappnetHeaders,
// 		url,
// 		timeStamp
// 	})

// 	tabStore[tabId] = tab
// }

// function getTabHistory({ message, sender, sendResponse }) {
// 	const { tabId } = message
// 	const tabHistory = _.get(tabStore, tabId, [])
// 	sendResponse(tabHistory)
// }