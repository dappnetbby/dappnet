eth-verifiable-rpc
==================

This implements verifiable RPC for Ethereum dapp developers.

This library runs a local EVM, which loads all contract code and storage dynamically while executing a transaction. It connects to a remote RPC node like Infura, and **verifiably** loads all state using storage proofs and `eth_getProof`.

