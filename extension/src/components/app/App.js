

export function App() {
    const domain = window.location.hash
    const ensHost = domain.split('#/')[1]
    console.log(ensHost)

    // Load the ENS hash for this thing.
    // console.log(window.ethereum)
    // console.log(window.web3)
    
    const gatewayRewrite = `https://${ensHost}.link` // Cloudflare eth.link.

    return <div>
        Loading {ensHost} from <a href={gatewayRewrite}>{gatewayRewrite}</a>...
        <iframe src={gatewayRewrite}></iframe>
    </div>
}