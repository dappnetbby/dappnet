import { useState, useEffect } from 'react'

const App = ({ config }) => {
    const [name, ensHost] = config.split(', ')
    const url = `https://${ensHost}.eth/`

    const onClick = () => {
        const a = document.createElement('a')
        a.href = url
        // open in new window
        a.target = '_blank'
        a.click()
    }

    return <div className={'app'} onClick={onClick}>
        <img src={`${ensHost}.jpg`}/>
        <div className='name'>{name}</div>
    </div>
}

function Home() {
    const apps = [
        'Uniswap, uniswap', 
        'Kwenta, kwenta', 
        'ENS, ens', 
        'Tornado Cash, tornadocash'
    ]

    return <div className="apps">
        { apps.map(app => <App key={app} config={app}/>) }
    </div>
}

// function Setup() {
//     return <div>
//         <h2>Welcome to Dappnet</h2>
//         <p>We need to set some things up to get this working:</p>

//     </div>
// }

// function Index() {
//     const [state, setState] = useState({
//         loading: true,
//         showHome: false,
//         statusCheck: null
//     })

//     const [finishingSetup, setFinishingSetup] = useState(false)

//     useEffect(async () => {
//         async function setup() {
//             const statusCheck = await window.electronMain.statusCheck()
//             setState({
//                 loading: false,
//                 statusCheck
//             })
//         }
//         setup()
//     }, [])

//     if(state.loading) {
//         return "Loading"
//     }

//     if (state.statusCheck.setupComplete || state.showHome) {
//         return <Home/>
//     }

//     async function finishSetup() {
//         await window.electronMain.installCA()
//         const statusCheck = await window.electronMain.statusCheck()
//         setState({
//             ...state,
//             statusCheck
//         })
//     }

//     return <div>
//         <h2>Setup</h2>

//         <button className='btn btn-primary btn-md' onClick={finishSetup} disabled={finishingSetup || state.statusCheck.setupComplete}>
//             Finish setup
//         </button>

//         {
//             !state.statusCheck.setupComplete &&
//             <pre>{JSON.stringify(state.statusCheck, null, 2)}</pre>
//         }

//         {
//             state.statusCheck.setupComplete && <>
//                 <p>{state.statusCheck.setupComplete && "Setup complete!"}</p>
                
//                 <button onClick={() => setState({ ...state, showHome: true })}>
//                     Let's go.
//                 </button>
//             </>
//         }
//     </div>
// }

export default Home