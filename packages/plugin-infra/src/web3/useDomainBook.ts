import type { NetworkPluginID } from '../web3-types'
import { usePluginWeb3StateContext } from './Context'

export function useDomainBook(pluginID?: NetworkPluginID) {
    const { domainBook } = usePluginWeb3StateContext(pluginID)
    return domainBook
}
