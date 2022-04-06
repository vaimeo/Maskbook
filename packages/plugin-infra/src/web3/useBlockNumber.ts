import { useAsyncRetry } from 'react-use'
import { useChainId, useWeb3State } from '.'
import type { NetworkPluginID } from '..'

export function useBlockNumber(expectedChainId?: number, pluginID?: NetworkPluginID) {
    const { Utils } = useWeb3State(pluginID)
    const defaultChainId = useChainId(pluginID)

    const chainId = expectedChainId ?? defaultChainId

    return useAsyncRetry(async () => {
        return Utils?.getLatestBlockNumber?.(chainId)
    }, [Utils?.getLatestBlockNumber, chainId])
}
