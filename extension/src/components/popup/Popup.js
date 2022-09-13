import { useEffect, useMemo, useReducer, useState } from "react"
import * as _ from 'lodash'

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await new Promise((res, rej) => chrome.tabs.query(queryOptions, res));
    return tab;
}

// const tabStore = {}
// const messageHandlers = {
//     'headers': handleHeaders
// }

// function handleHeaders({ message, sender, sendResponse }) {
//     const { tabId, timeStamp, requestId, url, headers } = message

//     // Extract any relevant detail from headers.
//     let dappnetHeaders = headers
//         .filter(({ name, value }) => name.startsWith('X-Dappnet'))
//     dappnetHeaders = _.fromPairs(dappnetHeaders.map(({ name, value }) => ([name, value])))

//     const tab = _.get(tabStore, tabId, [])
//     tab.push({
//         headers: dappnetHeaders,
//         url,
//         timeStamp
//     })

//     tabStore[tabId] = tab
// }

export function Popup() {
    // const [state, setState] = useState(tabStore)
    const [currentTab, setCurrentTab] = useState(null)
    const [tabData, setTabData] = useState(null)
    

    async function run() {
        const tab = await getCurrentTab()
        console.log(`tab`, tab)
        if(!tab) return
        setCurrentTab(tab)
    }

    useEffect(() => {
        run()

        // chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
        //     console.debug(`message`, message.type, message)
        //     await messageHandlers[message.type]({
        //         message,
        //         sender,
        //         sendResponse
        //     })
        //     console.log(`tabStore`, tabStore)
        //     setState(tabStore)
        // })

        // chrome.tabs.onActivated.addListener(async activeInfo => {
        // })

        // chrome.tabs.onUpdated.addListener(async (tabId, change, tab2) => {
        // })
    }, [])

    
    useEffect(() => {
        if (!currentTab) return

        async function get(tab) {
            console.log(tab)
            if(!tab) return
            const tabHistory = await new Promise((res, rej) => chrome.runtime.sendMessage({ type: "getTabHistory", tabId: tab.id }, res));
            console.log(tabHistory)

            // const tab = await new Promise((res, rej) => chrome.tabs.get(tab.id, res))
            const _tabData = _.findLast(tabHistory, item => item.url == tab.url)
            console.log(`tabData`, _tabData)
            setTabData(_tabData)
        }

        async function run() {
            await get(await getCurrentTab())
        }

        // run()
        
        get(currentTab)
        
    }, [currentTab])


    console.log(`currentTab`, currentTab)
    // console.log(`tabData`, tabData)
    if (!currentTab) return <></>

    let ipfsData
    if (tabData) {
        const ipnsName = _.get(tabData, ['headers', 'X-Dappnet-IPNS'], "")
        const ipfsCidRoots = _.get(tabData, ['headers', 'X-Ipfs-Roots'], "")
        const ipfsCid = ipfsCidRoots.split(',').slice(-1)

        if (ipfsCidRoots) {
            let title
            const tabUrl = new URL(currentTab.url)
            console.log(tabUrl)
            if (tabUrl.pathname == '/') {
                title = tabUrl.host
            } else {
                const filename = tabUrl.pathname.split('/').slice(-1)
                title = filename
            }

            console.log(ipfsCid)
            const ipfsHttpPathGateway = `https://cloudflare-ipfs.com`

            ipfsData = <div>
                {/* <span>IPNS name - {ipnsName}</span> */}
                Content: <strong>{title}</strong>
                <div>
                    Loaded from: <a href={`${ipfsHttpPathGateway}/ipfs/${ipfsCid}/`} target="_blank">IPFS</a>
                </div>
            </div>
        } else {

        }
    }

    let body = 'Connected to the dappnet.'
    if(ipfsData) body = ipfsData

    return <div>
        <div className="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
                <svg className="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#007aff"></rect></svg>
                <strong className="me-auto">Dappnet</strong>
                {/* <small>last synced 11 mins ago</small> */}
                {/* <button type="button" onClick={window.close} className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button> */}
            </div>
            <div className="toast-body">
                {body}
            </div>
        </div>
    </div>
}