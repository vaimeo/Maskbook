import type { NetworkPluginID } from '..'
import { useProviderType } from './useProviderType'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { getPluginDefine } from '../manager/store'

export function useProviderDescriptor(expectedPluginID?: NetworkPluginID, expectedProviderTypeOrID?: string) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const providerType = useProviderType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Providers?.find((x) =>
        [x.type, x.ID].includes(expectedProviderTypeOrID ?? providerType ?? ''),
    )
}
