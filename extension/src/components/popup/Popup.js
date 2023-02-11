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

// cond is from Lisp, the most beautiful proglang.
const cond = (conds) => {
    for (let cond of conds) {
        const [predicate, body] = cond
        if (predicate) {
            return body()
        }
    }
}

export function Popup() {
    const [currentTab, setCurrentTab] = useState(null)
    const [tabData, setTabData] = useState(null)
    const [connected, setConnected] = useState('loading')

    // async function run() {
    //     const tab = await getCurrentTab()
    //     console.log(`tab`, tab)
    //     if(!tab) return

    //     // Now get the tab data.
    //     // fetch(`http://127.0.0.1:10422/${url.pathname}`

    //     setCurrentTab(tab)
    // }

    // useEffect(() => {
    //     run()
    // }, [])

    
    // useEffect(() => {
    //     if (!currentTab) return

    //     async function get(tab) {
    //         console.log(tab)
    //         if(!tab) return
    //         const tabHistory = await new Promise((res, rej) => chrome.runtime.sendMessage({ type: "getTabHistory", tabId: tab.id }, res));
    //         console.log(tabHistory)

    //         // const tab = await new Promise((res, rej) => chrome.tabs.get(tab.id, res))
    //         const _tabData = _.findLast(tabHistory, item => item.url == tab.url)
    //         console.log(`tabData`, _tabData)
    //         setTabData(_tabData)
    //     }

    //     async function run() {
    //         await get(await getCurrentTab())
    //     }

    //     // run()
        
    //     get(currentTab)
        
    // }, [currentTab])


    // console.log(`currentTab`, currentTab)
    // // console.log(`tabData`, tabData)
    // if (!currentTab) 
    //     return <Toast body={<div/>} />

    // let ipfsData
    // if (tabData) {
    //     const ipnsName = _.get(tabData, ['headers', 'X-Dappnet-IPNS'], "")
    //     const ipfsCidRoots = _.get(tabData, ['headers', 'X-Ipfs-Roots'], "")
    //     const ipfsCid = ipfsCidRoots.split(',').slice(-1)

    //     if (ipfsCidRoots) {
    //         let title
    //         const tabUrl = new URL(currentTab.url)
    //         console.log(tabUrl)
    //         if (tabUrl.pathname == '/') {
    //             title = tabUrl.host
    //         } else {
    //             const filename = tabUrl.pathname.split('/').slice(-1)
    //             title = filename
    //         }

    //         console.log(ipfsCid)
    //         const ipfsHttpPathGateway = `https://cloudflare-ipfs.com`

    //         ipfsData = <div>
    //             {/* <span>IPNS name - {ipnsName}</span> */}
    //             Content: <strong>{title}</strong>
    //             <div>
    //                 Loaded from: <a href={`${ipfsHttpPathGateway}/ipfs/${ipfsCid}/`} target="_blank">IPFS</a>
    //             </div>
    //         </div>
    //     } else {

    //     }
    // }

    const checkConnectionToDappnet = async () => {
        try {
            const res = await fetch(`http://localhost:10422/`, {
                headers: {
                    "Host": "vitalik.eth"
                }
            })
            if (res.status == 200) {
                setConnected('yes')
            } else {
                setConnected('no')
            }
        } catch (e) {
            setConnected('no')
        }
    }

    useEffect(() => {
        checkConnectionToDappnet()
    }, [])


    // This isn't needed because when the popup is opened, the entire extension is re-rendered. It doesn't retain state.
    // Query the Dappnet local gateway on a timer every 2s.
    // If the query fails, then we know we aren't connected.
    // useEffect(() => {
    //     const interval = setInterval(async () => {
            
    //     }, 2000);
    //     return () => clearInterval(interval);
    // }, []);

    let body = <div>
        {
            cond([
                [connected == 'loading', () => <div>Checking your connection...</div>],
                [connected == 'yes', () => <div>✅ Connected to the dappnet.</div>],
                [connected == 'no', () => <div>❗️ Not connected to the dappnet. Is the desktop client running?</div>],
            ])
        }
    </div>
    
    return <Toast body={body}/>
}

const Toast = ({ body }) => {
    return <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="toast-header">
            {/* <svg className="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#007aff"></rect></svg> */}
            {/* <img src="../../../icon-128.png" width={20} height={20} /> */}
            <strong className="me-auto">Dappnet</strong>
            {/* <small>last synced 11 mins ago</small> */}
            {/* <button type="button" onClick={window.close} className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button> */}
        </div>
        <div className="toast-body">
            {body}
        </div>
    </div>
}