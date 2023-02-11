
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

export default () => <div></div>