import { getEnumAsArray } from '@dimensiondev/kit'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { AccountState, CurrencyType, Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    getChainIdFromNetworkType,
    getNetworkTypeFromChainId,
    isSameAddress,
    isValidAddress,
    NetworkType,
    ProviderType,
} from '@masknet/web3-shared-evm'

interface AccountStorage {
    chainId: ChainId
    account: string
    currencyType: CurrencyType
    providerType: ProviderType
    networkType: NetworkType
}

const DEFAULT_CHAIN_OPTINOS: AccountStorage = {
    account: '',
    chainId: ChainId.Mainnet,
    currencyType: CurrencyType.USD,
    networkType: NetworkType.Ethereum,
    providerType: ProviderType.MaskWallet,
}

export class Account extends AccountState<ChainId, ProviderType, NetworkType, AccountStorage> {
    constructor(override context: Plugin.Shared.SharedContext) {
        const defaultValue = [...getEnumAsArray(EnhanceableSite), ...getEnumAsArray(ExtensionSite)].reduce(
            (accumulator, site) => {
                accumulator[site.value] = DEFAULT_CHAIN_OPTINOS
                return accumulator
            },
            {} as Record<EnhanceableSite | ExtensionSite, AccountStorage>,
        )

        super(context, defaultValue)
    }

    override async updateAccount(site: EnhanceableSite | ExtensionSite, options: Partial<AccountStorage>) {
        if (options.chainId && !options.networkType) options.networkType = getNetworkTypeFromChainId(options.chainId)
        if (!options.chainId && options.networkType) options.chainId = getChainIdFromNetworkType(options.networkType)

        // make sure account and provider type to be updating both
        if ((options.account && !options.providerType) || (options.account === undefined && options.providerType))
            throw new Error('Account and provider type should update together.')

        const { account, chainId, providerType, networkType } = options

        // update wallet in the DB
        if (
            account &&
            providerType &&
            isValidAddress(account) &&
            providerType !== ProviderType.MaskWallet &&
            !this.context.wallets.getCurrentValue().some((x) => isSameAddress(x.address, account))
        ) {
            await this.context.updateWallet(account, {})
        }

        await super.updateAccount(site, {
            ...this.storage[site].value,
            ...options,
        })

        if (providerType === ProviderType.MaskWallet) {
            await this.context.updateAccount({
                account,
                chainId,
                networkType,
                providerType: ProviderType.MaskWallet,
            })
        }
    }
}
