import type { TransactionReceipt } from 'web3-core'
import {
    EthereumMethodType,
    EthereumTransactionConfig,
    getReceiptStatus,
    TransactionStatusType,
} from '@masknet/web3-shared-evm'
import type { Context, Middleware } from '../types'
import { sendTransaction } from '../network'
import { getWeb3State } from '../../../state'

export class RecentTransaction implements Middleware<Context> {
    async fn(context: Context, next: () => Promise<void>) {
        let replacedHash

        switch (context.method) {
            case EthereumMethodType.MASK_REPLACE_TRANSACTION:
                try {
                    const [hash, config] = context.request.params as [string, EthereumTransactionConfig]

                    // remember the hash of the replaced tx
                    replacedHash = hash
                    context.write(await sendTransaction(config, context.sendOverrides, context.requestOptions))
                } catch (error) {
                    context.abort(error)
                }
                break
        }

        await next()

        try {
            switch (context.method) {
                case EthereumMethodType.ETH_SEND_TRANSACTION:
                    if (!context.config || typeof context.result !== 'string') return
                    if (replacedHash)
                        await getWeb3State().Transaction?.replaceTransaction?.(
                            context.chainId,
                            context.account,
                            replacedHash,
                            context.result,
                            context.config,
                        )
                    else
                        await getWeb3State().Transaction?.addTransaction?.(
                            context.chainId,
                            context.account,
                            context.result,
                            context.config,
                        )
                    break
                case EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT:
                    const receipt = context.result as TransactionReceipt | null
                    const status = getReceiptStatus(receipt)
                    if (receipt?.transactionHash && status !== TransactionStatusType.NOT_DEPEND) {
                        await getWeb3State().Transaction?.updateTransaction?.(
                            context.chainId,
                            context.account,
                            receipt.transactionHash,
                            status,
                        )
                    }
                    break
            }
        } catch {
            // to record tx in the database, allow to fail silently
        }
    }
}
