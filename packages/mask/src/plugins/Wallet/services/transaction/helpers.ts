import { sha3, toHex } from 'web3-utils'
import type { JsonRpcPayload } from 'web3-core-helpers'
import type { Transaction, TransactionConfig, TransactionReceipt } from 'web3-core'
import {
    TransactionState,
    TransactionStateType,
    TransactionStatusType,
    EthereumMethodType,
} from '@masknet/web3-shared-evm'
import { unreachable } from '@dimensiondev/kit'

export function toPayload(transaction: Transaction): JsonRpcPayload {
    return {
        jsonrpc: '2.0',
        id: '0',
        method: EthereumMethodType.ETH_SEND_TRANSACTION,
        params: [
            {
                from: transaction.from,
                to: transaction.to,
                value: transaction.value,
                gas: transaction.gas,
                gasPrice: transaction.gasPrice,
                data: transaction.input,
                nonce: transaction.nonce,
            },
        ],
    }
}

export function getPayloadConfig(payload: JsonRpcPayload) {
    if (!payload.id || payload.method !== EthereumMethodType.ETH_SEND_TRANSACTION) return
    const [config] = payload.params as [TransactionConfig]
    return config
}

export function getPayloadFrom(payload: JsonRpcPayload) {
    const config = getPayloadConfig(payload)
    return config?.from as string | undefined
}

export function getPayloadId(payload: JsonRpcPayload) {
    const config = getPayloadConfig(payload)
    if (!config) return ''
    const { from, to, data = '0x0', value = '0x0' } = config
    if (!from || !to) return ''
    return sha3([from, to, data, value].join('_')) ?? ''
}

export function getTransactionId(transaction: Transaction | null) {
    if (!transaction) return ''
    const { from, to, input, value } = transaction
    return sha3([from, to, input || '0x0', toHex(value || '0x0') || '0x0'].join('_')) ?? ''
}

export function getReceiptStatus(receipt: TransactionReceipt | null) {
    if (!receipt) return TransactionStatusType.NOT_DEPEND
    const status = receipt.status as unknown as string
    if (receipt.status === false || ['0', '0x', '0x0'].includes(status)) return TransactionStatusType.FAILED
    if (receipt.status === true || ['1', '0x1'].includes(status)) {
        return TransactionStatusType.SUCCEED
    }
    return TransactionStatusType.NOT_DEPEND
}

export function getTransactionState(receipt: TransactionReceipt): TransactionState {
    if (receipt.blockNumber) {
        const status = getReceiptStatus(receipt)
        switch (status) {
            case TransactionStatusType.SUCCEED:
                return {
                    type: TransactionStateType.CONFIRMED,
                    no: 0,
                    receipt,
                }
            case TransactionStatusType.FAILED:
                return {
                    type: TransactionStateType.FAILED,
                    receipt,
                    error: new Error('FAILED'),
                }
            case TransactionStatusType.NOT_DEPEND:
                return {
                    type: TransactionStateType.FAILED,
                    receipt,
                    error: new Error('Invalid transaction status.'),
                }
            default:
                unreachable(status)
        }
    }
    return {
        type: TransactionStateType.RECEIPT,
        receipt,
    }
}
