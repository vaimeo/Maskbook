import { first } from 'lodash-unified'
import type { RequestArguments, TransactionConfig } from 'web3-core'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, getReceiptStatus } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'

export class ProtocolState
    implements Web3Plugin.ObjectCapabilities.ProtocolState<ChainId, RequestArguments, TransactionConfig>
{
    constructor(private context: Plugin.Shared.SharedContext) {}

    async getAccount() {
        const accounts = await EVM_RPC.getAccounts()
        return first(accounts) ?? ''
    }
    async getChainId() {
        const hex = await EVM_RPC.getChainId()
        return Number.parseInt(hex, 16)
    }
    getLatestBalance(chainId: ChainId, account: string) {
        return EVM_RPC.getBalance(account, {
            account,
            chainId,
        })
    }
    getLatestBlockNumber(chainId: ChainId) {
        return EVM_RPC.getBlockNumber({
            chainId,
        })
    }
    signMessage(
        address: string,
        message: string,
        signType: string | Omit<string, 'personal' | 'typedData'> = 'personal',
    ) {
        switch (signType) {
            case 'personal':
                return EVM_RPC.personalSign(message, address, '')
            case 'typedData':
                return EVM_RPC.typedDataSign(address, message)
            default:
                throw new Error(`Unknown sign type: ${signType}`)
        }
    }
    signTransaction(address: string, transaction: TransactionConfig) {
        return this.context.signTransaction(address, transaction)
    }
    async getTransactionStatus(chainId: ChainId, id: string) {
        const receipt = await EVM_RPC.getTransactionReceipt(id, {
            chainId,
        })
        return getReceiptStatus(receipt)
    }

    async sendTransaction(chainId: ChainId, transaction: TransactionConfig) {
        if (!transaction.from) throw new Error('An invalid transaction.')
        const rawTransaction = await this.signTransaction(transaction.from as string, transaction)
        const txHash = await EVM_RPC.sendRawTransaction(rawTransaction, {
            chainId,
        })

        return txHash
    }
    async sendRawTransaction(chainId: ChainId, rawTransaction: string) {
        const txHash = await EVM_RPC.sendRawTransaction(rawTransaction, {
            chainId,
        })
        return txHash
    }
    async sendAndConfirmTransactions(chainId: ChainId, transaction: TransactionConfig) {
        const txHash = await this.sendTransaction(chainId, transaction)

        // TODO: implement it
        // await waitForConfirmation(hash)
    }
}
