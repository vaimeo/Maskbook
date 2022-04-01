import { uniqBy } from 'lodash-unified'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, formatEthereumAddress, isSameAddress } from '@masknet/web3-shared-evm'
import { getStorageValue, setStorageValue } from '../storage'

export class AddressBookState implements Web3Plugin.ObjectCapabilities.AddressBookState {
    async addAddress(chainId: ChainId, address: string) {
        const addressBook = await getStorageValue('memory', 'addressBook')
        await setStorageValue('memory', 'addressBook', {
            ...addressBook,
            [chainId]: uniqBy([...addressBook[chainId], formatEthereumAddress(address)], (x) => x.toLowerCase()),
        })
    }
    async removeAddress(chainId: ChainId, address: string) {
        const addressBook = await getStorageValue('memory', 'addressBook')
        await setStorageValue('memory', 'addressBook', {
            ...addressBook,
            [chainId]: addressBook[chainId]?.filter((x) => !isSameAddress(x, address)),
        })
    }
}
