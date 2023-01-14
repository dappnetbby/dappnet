https://hackmd.io/wAfo9dm9S0iMkaXWRIsYUw
https://eips.ethereum.org/EIPS/eip-1186

```py
verifiable_execute(tx):
    tx.from
    tx.to
    tx.data

    # load code for tx.from
    # insert into evm
    # begin executing:
        # if sload/sstore, then we interrupt and fetch this state
        # if call/staticcall/delegatecall/etc., then we interrupt and fetch that contract
        # otherwise, continue
    # 
```