import * as ethers from 'ethers'

import { Blockchain } from '@ethereumjs/blockchain'
import { Chain, Common, Hardfork } from '@ethereumjs/common'
import { EEI } from '@ethereumjs/vm'
import { EVM } from '@ethereumjs/evm'
import { EVMOpts } from '@ethereumjs/evm/src/evm'
import { DefaultStateManager } from '@ethereumjs/statemanager'

import type { StateManager } from '@ethereumjs/statemanager'
import { Address } from '@ethereumjs/util'
import { Account } from '@ethereumjs/util'

import { keccak256 } from 'ethereum-cryptography/keccak'


const provider = new ethers.providers.InfuraProvider()
// const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545')


interface HookedStateAccess {
    // accountExists(address: Address): Promise<boolean>
    getAccount(address: Address): Promise<Account>
    // putAccount(address: Address, account: Account): Promise<void>
    // accountIsEmpty(address: Address): Promise<boolean>
    // deleteAccount(address: Address): Promise<void>
    // modifyAccountFields(address: Address, accountFields: AccountFields): Promise<void>
    // putContractCode(address: Address, value: Buffer): Promise<void>
    getContractCode(address: Address): Promise<Buffer>
    getContractStorage(address: Address, key: Buffer): Promise<Buffer>
    // putContractStorage(address: Address, key: Buffer, value: Buffer): Promise<void>
    // clearContractStorage(address: Address): Promise<void>
    // checkpoint(): Promise<void>
    // commit(): Promise<void>
    // revert(): Promise<void>
    // getStateRoot(): Promise<Buffer>
    // setStateRoot(stateRoot: Buffer): Promise<void>
    // getProof?(address: Address, storageSlots: Buffer[]): Promise<Proof>
    // verifyProof?(proof: Proof): Promise<boolean>
    // hasStateRoot(root: Buffer): Promise<boolean>
}

class VerifiableEthExecEnv extends EEI implements HookedStateAccess {
    protected _provider: ethers.providers.JsonRpcProvider
    protected warm: Record<any, boolean> = {}
    protected warm2: Record<any, boolean> = {}
    protected warm3: Record<any, boolean> = {}
    protected stateRoot: string;
    protected blockNumber: string

    constructor(stateManager: StateManager, common: Common, blockchain: Blockchain, stateRoot: string, blockNumber: string) {
        super(stateManager, common, blockchain)
        this._provider = provider
        this.stateRoot = stateRoot
        this.blockNumber = blockNumber
    }

    async _getProof({ address, storageKeys } : { address: string, storageKeys?: string[] }) {
        const { stateRoot, blockNumber } = this

        const proof = await provider.send('eth_getProof', [
            address,
            storageKeys || [],
            blockNumber
        ])

        const success = await this._stateManager.verifyProof!(proof)
        if(!success) throw new Error("proof invalid")
        
        return proof
    }

    /**
     * Gets the account associated with `address`. Returns an empty account if the account does not exist.
     * @param address - Address of the `account` to get
     */
    async getAccount(address: Address): Promise<Account> {
        // Check 1st load.
        if(this.warm[address.toString()]) {
            return await this._stateManager.getAccount(address)
        }
        this.warm[address.toString()] = true

        // Skip 0x0 address.
        if(address.toString() == ethers.constants.AddressZero) {
            return await this._stateManager.getAccount(address)
        }

        // Lookup from RPC.
        const res = await this._getProof({ address: address.toString() })
        const account = await Account.fromAccountData({
            ...res,
            storageRoot: res.storageHash
        })
        await this._stateManager.putAccount(address, account)

        return account
    }

    /**
     * Gets the code corresponding to the provided `address`.
     * @param address - Address to get the `code` for
     * @returns {Promise<Buffer>} -  Resolves with the code corresponding to the provided address.
     * Returns an empty `Buffer` if the account has no associated code.
     */
    async getContractCode(address: Address): Promise<Buffer> {
        // Check 1st load.
        if (this.warm2[address.toString()]) {
            return await this._stateManager.getContractCode(address)
        }
        this.warm2[address.toString()] = true


        // Lookup from RPC.
        const res = await this._getProof({ address: address.toString() })
        const code = await this._provider.send('eth_getCode', [
            address.toString(),
            this.blockNumber
        ])

        const buf = Buffer.from(code.slice(2), 'hex')
        await this._stateManager.putContractCode(address, buf)

        return buf
    }

    /**
     * Gets the storage value associated with the provided `address` and `key`. This method returns
     * the shortest representation of the stored value.
     * @param address -  Address of the account to get the storage for
     * @param key - Key in the account's storage to get the value for. Must be 32 bytes long.
     * @returns {Promise<Buffer>} - The storage value for the account
     * corresponding to the provided address at the provided key.
     * If this does not exist an empty `Buffer` is returned.
     */
    async getContractStorage(address: Address, key: Buffer): Promise<Buffer> {
        // Check 1st load.
        const id = `${address.toString()}-${key.toString('hex')}`
        if (this.warm3[id]) {
            return await this._stateManager.getContractStorage(address, key)
        }
        this.warm3[id] = true

        // Lookup from RPC.
        const res = await this._getProof({ address: address.toString(), storageKeys: [ '0x' + key.toString('hex')] })
        const value = Buffer.from(res.slice(2), 'hex')

        // const decoded = Buffer.from(RLP.decode(Uint8Array.from(value ?? [])) as Uint8Array)
        this._stateManager.putContractStorage(address, key, value)
        return value
    }

    // 
    // EEI.
    // 

    /**
     * Returns balance of the given account.
     * @param address - Address of account
     */
    async getExternalBalance(address: Address): Promise<bigint> {
        console.log('getExternalBalance', address.toString())
        // const account = await this.getAccount(address)
        // return account.balance
        const balance = await this._provider.getBalance(address.toString())
        return BigInt(balance.toString())
    }

    /**
     * Get size of an account’s code.
     * @param address - Address of account
     */
    async getExternalCodeSize(address: Address): Promise<bigint> {
        console.log('getExternalCodeSize', address.toString())
        // const code = await this.getContractCode(address)
        // return BigInt(code.length)
        const code = await this.getExternalCode(address)
        return BigInt(code.length)
    }

    /**
     * Returns code of an account.
     * @param address - Address of account
     */
    async getExternalCode(address: Address): Promise<Buffer> {
        console.log('getExternalCode', address.toString())
        const code = await this._provider.send('eth_getCode', [
            address.toString(),
            'latest'
        ])
        console.log(code)
        return Buffer.from(code.slice(2), 'hex')
    }

    /**
     * Returns Gets the hash of one of the 256 most recent complete blocks.
     * @param num - Number of block
     */
    async getBlockHash(num: bigint): Promise<bigint> {
        const res = await this._provider.getBlock(num.toString())
        return BigInt(res.hash)
    }

    // /**
    //  * Storage 256-bit value into storage of an address
    //  * @param address Address to store into
    //  * @param key Storage key
    //  * @param value Storage value
    //  */
    // async storageStore(address: Address, key: Buffer, value: Buffer): Promise<void> {
    //     await this.putContractStorage(address, key, value)
    // }

    /**
     * Loads a 256-bit value to memory from persistent storage.
     * @param address Address to get storage key value from
     * @param key Storage key
     * @param original If true, return the original storage value (default: false)
     */
    async storageLoad(address: Address, key: Buffer, original = false): Promise<Buffer> {
        // TODO: 1st load. Though this probably doesn't matter.
        const proof = await this._getProof({ address: address.toString(), storageKeys: ['0x' + key.toString('hex')] })
        const value = proof.storageProof[0].value
        return Buffer.from(value.slice(2), 'hex')
        // if (original) {
        //     return this.getOriginalContractStorage(address, key)
        // } else {
        //     // return this.getContractStorage(address, key)
        //     const res = await this._provider.send('eth_getStorageAt', [
        //         address.toString(),
        //         '0x' + key.toString('hex'),
        //         'latest'
        //     ])
        //     return Buffer.from(res.slice(2), 'hex')
        // }
    }
}

class EVM2 extends EVM {
    constructor(opts: EVMOpts) {
        super(opts)
    }
}

async function main() {
    const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.London })
    const stateManager = new DefaultStateManager()
    const blockchain = await Blockchain.create()
    
    // CC: MERGEWAP CODEBASE
    // Fetch latest state root.
    // We need to use eth_getBlockByNumber to get the rawBlock.stateRoot.
    // See: https://github.com/ethers-io/ethers.js/issues/667
    // const rawBlock = await getLatestBlockWithNConfirmations(chainConfig.provider, chainConfig.confirmations)
    const latestBlock = await provider.getBlock("latest");
    const rawBlock = await provider.send("eth_getBlockByNumber", [
        ethers.utils.hexValue(latestBlock.number),
        true,
    ]);

    const eei = new VerifiableEthExecEnv(stateManager, common, blockchain, rawBlock.stateRoot, ethers.utils.hexValue(latestBlock.number))

    const evm = new EVM2({
        common,
        eei,
    })

    // Construct tornadocash ENS lookup.
    //
    //
    // (base) ➜  verifiable-rpc git:(master) ✗ cast abi-encode "contenthash(bytes32 node)(bytes memory)" $(cast --from-ascii "tornadocash.eth")
    // 0x746f726e61646f636173682e6574680000000000000000000000000000000000
    const iface = new ethers.utils.Interface([
        "function addr(bytes32 node) public view returns (address)",
        "function contenthash(bytes32 node) external view returns (bytes memory)"
    ])
    const CONTRACT_ADDRESS = '0xd3ddccdd3b25a8a7423b5bee360a42146eb4baf3'
    const calldata = iface.encodeFunctionData("contenthash", ["0xe6ae31d630cc7a8279c0f1c7cbe6e7064814c47d1785fa2703d9ae511ee2be0c"])
    
    
    // const calldata = iface.encodeFunctionData("contenthash", [ethers.utils.formatBytes32String("vitalik.eth")])

    // const iface = new ethers.utils.Interface([
    //     "function balanceOf(address) public view returns (uint256)"
    // ])
    // const CONTRACT_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
    // // const calldata = iface.encodeFunctionData("contenthash", [ethers.utils.formatBytes32String("vitalik.eth")])
    // const calldata = iface.encodeFunctionData("balanceOf", ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"])

    // const iface = new ethers.utils.Interface([
    //     "function getCount(uint256) public view returns (uint256)"
    // ])
    // const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3'
    // // const calldata = iface.encodeFunctionData("contenthash", [ethers.utils.formatBytes32String("vitalik.eth")])
    // const calldata = iface.encodeFunctionData("getCount", ["123"])

    
    const msg = {
        from: ethers.constants.AddressZero,
        to: CONTRACT_ADDRESS,
        data: calldata,
    }

    // console.log(msg)

    // evm.events.on('step', async function (data) {
    //     // data.gasLeft = BigInt(0xffffffffffffff)
    //     // Note that data.stack is not immutable, i.e. it is a reference to the vm's internal stack object
    //     // console.log(`Opcode: ${data.opcode.name}\tStack: ${data.stack}`)

    //     console.log(
    //         (await stateManager.getContractCode(
    //             Address.fromString('0x5fbdb2315678afecb367f032d93f642f64180aa3'))
    //         ).toString('hex')
    //     )
    // })


    // Now load the code.
    const msgCoded = {
        to: Address.fromString(msg.to),
        caller: Address.fromString(msg.from),
        data: Buffer.from(msg.data.slice(2), 'hex'),
        
        // Gas.
        gasLimit: ethers.constants.MaxUint256.toBigInt(),
        gasRefund: ethers.constants.MaxUint256.toBigInt(),
        gasPrice: BigInt(0x1),
        skipBalance: true,
    }
    // console.log(msgCoded)
    
    try {
        const { execResult: res } = await evm.runCall(msgCoded)
        console.log(res.exceptionError)
        console.log(`Returned: ${res.returnValue.toString('hex')}`)
        console.log(`gasUsed: ${res.executionGasUsed.toString()}`)

    } catch(err) {
        console.log(err)
    }
    
}

main()