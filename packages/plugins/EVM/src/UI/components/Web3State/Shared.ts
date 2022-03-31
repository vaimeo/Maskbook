import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    NetworkType,
    NonFungibleAssetProvider,
    ProviderType,
    ChainOptions,
    FungibleAssetProvider,
    DomainProvider,
    CurrencyType,
} from '@masknet/web3-shared-evm'
import {
    createConstantSubscription,
    getEnhanceableSiteType,
    getExtensionSiteType,
    mapSubscription,
} from '@masknet/shared-base'
import { EVM_RPC } from '../../../messages'
export class SharedState {
    private async createSubscriptionFromChainOptions<T>(getter: (value: ChainOptions | undefined) => T) {
        const enhanceableSiteType = getEnhanceableSiteType()
        const extensionSiteType = getExtensionSiteType()
        return mapSubscription(await EVM_RPC.getStorageSubscription('memory', 'chainOptions'), (chainOptions) => {
            return getter(
                enhanceableSiteType
                    ? chainOptions[enhanceableSiteType]
                    : extensionSiteType
                    ? chainOptions[extensionSiteType]
                    : undefined,
            )
        })
    }

    async create(): Promise<Web3Plugin.ObjectCapabilities.SharedState> {
        return {
            allowTestnet: createConstantSubscription(process.env.NODE_ENV === 'development'),
            chainId: await this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.chainId ?? ChainId.Mainnet,
            ),
            account: await this.createSubscriptionFromChainOptions((chainOptions) => chainOptions?.account ?? ''),
            networkType: await this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.networkType ?? NetworkType.Ethereum,
            ),
            providerType: await this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.providerType ?? ProviderType.MaskWallet,
            ),
            assetType: await this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.assetType ?? FungibleAssetProvider.DEBANK,
            ),
            nameType: await this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.nameType ?? DomainProvider.ENS,
            ),
            collectibleType: await this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.nameType ?? NonFungibleAssetProvider.OPENSEA,
            ),
            currencyType: await this.createSubscriptionFromChainOptions(
                (chainOptions) => chainOptions?.currencyType ?? CurrencyType.USD,
            ),
        }
    }
}
