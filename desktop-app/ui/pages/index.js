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

const release = require('../../package.json').version

function Home() {
    const apps = [
        // 'Uniswap, uniswap',
        'Kwenta, kwenta',
        'ENS, ens',
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
                Dappnet {release} &middot; The Times 03/Jan/2009 Chancellor on brink of second bailout for banks.
            </footer>
        </main>
    </div>
}


export default Home