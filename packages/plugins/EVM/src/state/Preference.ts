import { Web3Plugin, CurrencyType } from '@masknet/plugin-infra'
import type { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import {
    getChainIdFromNetworkType,
    getNetworkTypeFromChainId,
    ChainId,
    NetworkType,
    ProviderType,
} from '@masknet/web3-shared-evm'
import { getStorageValue, setStorageValue } from '../storage'

export class PreferenceState implements Web3Plugin.ObjectCapabilities.PreferenceState {
    async updatePreference(
        site: EnhanceableSite | ExtensionSite,
        options: {
            account?: string
            chainId?: ChainId
            networkType?: NetworkType
            providerType?: ProviderType
        },
    ) {
        if (options.chainId && !options.networkType) options.networkType = getNetworkTypeFromChainId(options.chainId)
        if (!options.chainId && options.networkType) options.chainId = getChainIdFromNetworkType(options.networkType)

        // make sure account and provider type to be updating both
        if ((options.account && !options.providerType) || (options.account === undefined && options.providerType))
            throw new Error('Account and provider type must be updating both.')

        // // update wallet in the DB
        // if (
        //     account &&
        //     providerType &&
        //     EthereumAddress.isValid(account) &&
        //     providerType !== ProviderType.MaskWallet &&
        //     !(await hasWallet(account))
        // ) {
        //     await updateWallet(account, {})
        // }

        const chainOptions = await getStorageValue('memory', 'chainOptions')

        chainOptions[site] = {
            ...chainOptions[site],
            ...options,
        }
        await setStorageValue('memory', 'chainOptions', chainOptions)

        // if (providerType === ProviderType.MaskWallet) {
        //     await updateMaskAccount({
        //         account,
        //         chainId,
        //         networkType
        //     })
        // }
    }

    async resetPreference(site: EnhanceableSite | ExtensionSite) {
        const chainOptions = await getStorageValue('memory', 'chainOptions')

        chainOptions[site] = {
            account: '',
            chainId: ChainId.Mainnet,
            networkType: NetworkType.Ethereum,
            providerType: ProviderType.MaskWallet,
            currencyType: CurrencyType.USD,
        }
        await setStorageValue('memory', 'chainOptions', chainOptions)
    }
}
