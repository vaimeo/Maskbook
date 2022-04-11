import { getEnumAsArray } from '@dimensiondev/kit'
import { AccountState, CurrencyType, Plugin } from '@masknet/plugin-infra'
import { EnhanceableSite, ExtensionSite } from '@masknet/shared-base'
import { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-flow'

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
    networkType: NetworkType.Flow,
    providerType: ProviderType.Blocto,
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
}
