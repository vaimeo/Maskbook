import { NetworkPluginID, usePluginIDContext } from '@masknet/plugin-infra'
import { rightShift } from '@masknet/web3-shared-base'
import {
    EthereumTokenType,
    isSameAddress,
    TransactionState,
    TransactionStateType,
    useTokenConstants,
    useTokenTransferCallback,
} from '@masknet/web3-shared-evm'
import { useTransferSol } from '@masknet/web3-shared-solana'
import { useCallback, useContext } from 'react'
import { TipContext } from './TipContext'
import type { TipTuple } from './type'

function useEvmTokenTip(): TipTuple {
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const context = useContext(TipContext)
    const { token, amount, recipient } = context

    const isNativeToken = isSameAddress(token?.address, NATIVE_TOKEN_ADDRESS)

    const assetType = isNativeToken ? EthereumTokenType.Native : EthereumTokenType.ERC20
    const [transferState, transferCallback, resetTransferCallback] = useTokenTransferCallback(
        assetType,
        token?.address || '',
    )
    const sendTip = useCallback(async () => {
        const transferAmount = rightShift(amount || '0', token?.decimals || 0).toFixed()
        await transferCallback(transferAmount, recipient)
        resetTransferCallback()
    }, [amount, token, recipient, transferCallback, resetTransferCallback])

    return [transferState, sendTip]
}
// TODO
function useSolanaSplTokenTip(): TipTuple {
    const txState: TransactionState = {
        type: TransactionStateType.UNKNOWN,
    }
    const transferSol = useTransferSol()
    const sendTip = useCallback(async () => {
        await transferSol({
            fromPubkey: '1',
        })
    }, [])

    return [txState, sendTip]
}

export function useTokenTip(): TipTuple {
    const pluginID = usePluginIDContext()
    const evmTipTuple = useEvmTokenTip()
    const solanaTipTuple = useSolanaSplTokenTip()
    const isEvm = pluginID === NetworkPluginID.PLUGIN_EVM
    return isEvm ? evmTipTuple : solanaTipTuple
}
