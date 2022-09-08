

export function Popup() {
    return <div>
        <div className="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-header">
                <svg className="bd-placeholder-img rounded me-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false"><rect width="100%" height="100%" fill="#007aff"></rect></svg>
                <strong className="me-auto">Dappnet</strong>
                {/* <small>last synced 11 mins ago</small> */}
                {/* <button type="button" onClick={window.close} className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button> */}
            </div>
            <div className="toast-body">
                Connected to the dappnet.
            </div>
            {/* <div>
                <p>
                    <strong>Cool new sites: </strong>
                    {
                        'tornadocash.eth uniswap.eth kwenta.eth ens.eth vitalik.eth'.split(' ').map(site => <a href={`https://${site}`}>{site}</a>).map(x => <>{x}, </>)
                    }
                </p>
            </div> */}
        </div>
    </div>
}