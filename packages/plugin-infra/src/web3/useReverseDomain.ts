import type { NetworkPluginID } from '../web3-types'
import { useChainId, useWeb3State } from '.'
import { useAsync } from 'react-use'

export function useReverseDomain(address?: string, pluginId?: NetworkPluginID) {
    const { NameService } = useWeb3State(pluginId)
    const chainId = useChainId(pluginId)

    return useAsync(async () => {
        return address ? NameService?.reverse?.(chainId, address) : undefined
    }, [NameService, address, chainId])
}
