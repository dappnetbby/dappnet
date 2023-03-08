import { useState, useEffect } from 'react'

const App = ({ config }) => {
    const [name, ensHost, imagePath] = config.split(', ')
    const url = `https://${ensHost}/`

    const onClick = () => {
        const a = document.createElement('a')
        a.href = url
        // open in new window
        a.target = '_blank'
        a.click()
    }

    return <div className={'app'} onClick={onClick}>
        <img src={imagePath}/>
        <div className='name'>{name}</div>
    </div>
}

const release = require('../../package.json').version

function Home() {
    const apps = [
        // 'Uniswap, uniswap',
        'Kwenta, kwenta.eth, /kwenta.jpg',
        'ENS, app.ens.eth, /ens.jpg',
        '1inch, 1inch.eth, /1inch.svg',
        'Compound, compoundprotocol.eth, /compound.png',
        'Curve, curve.eth, /curve.png',
        "Vitalik's blog, vitalik.eth, /vitalik.png",
        // 'Liquity, lusd.eth, http://lusd.eth/',
    ]

    return <div className='container'>
        <main>
            <header></header>

            <div>
                <div className="apps">
                    { apps.map(app => <App key={app} config={app}/>) }
                </div>
            </div>

            <footer>
                Dappnet {release}
            </footer>
        </main>
    </div>
}


export default Home