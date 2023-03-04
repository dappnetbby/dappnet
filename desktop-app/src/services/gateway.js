import * as LocalGateway from '@dappnet/local-gateway';
import * as sourceMap from 'source-map-support';
sourceMap.install();

async function main() {
    // Launch the .eth -> IPFS gateway.
    const ensGateway = LocalGateway.start();
}

const config = {}

main(config).catch(err => {
    throw err
})