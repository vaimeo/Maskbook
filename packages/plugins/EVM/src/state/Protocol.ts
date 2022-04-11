import type { RequestArguments, TransactionConfig } from 'web3-core'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, getReceiptStatus, RequestOptions, SendOverrides } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'

type SignType = string | Omit<string, 'personal' | 'typedData'>

export class ProtocolState
    implements Web3Plugin.ObjectCapabilities.ProtocolState<ChainId, RequestArguments, TransactionConfig>
{
    constructor(private context: Plugin.Shared.SharedContext) {}

    request<T>(
        chainId: ChainId,
        requestArguments: RequestArguments,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ) {
        return EVM_RPC.request<T>(
            requestArguments,
            {
                ...overrides,
                chainId,
            },
            options,
        )
    }
    getLatestBalance(chainId: ChainId, account: string) {
        return EVM_RPC.getBalance(account, {
            chainId,
        })
    }
    getLatestBlockNumber(chainId: ChainId) {
        return EVM_RPC.getBlockNumber({
            chainId,
        })
    }
    signMessage(address: string, message: string, signType: SignType = 'personal') {
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
        const signed = await this.signTransaction(transaction.from as string, transaction)
        const txHash = await EVM_RPC.sendRawTransaction(signed, {
            chainId,
        })

        return txHash
    }
    async sendAndConfirmTransactions(chainId: ChainId, transaction: TransactionConfig) {
        const hash = await this.sendTransaction(chainId, transaction)

        // TODO: implement it
        // await waitForConfirmation(hash)
    }
}
