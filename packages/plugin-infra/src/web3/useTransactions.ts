import type { NetworkPluginID, TransactionStatusType } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useTransactions(pluginID?: NetworkPluginID, status?: TransactionStatusType) {
    const { transactions } = usePluginWeb3StateContext(pluginID)
    if (typeof status === 'undefined') return transactions
    return transactions.filter((x) => status === x.status)
}
