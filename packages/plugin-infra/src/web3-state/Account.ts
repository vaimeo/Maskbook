import type { Subscription } from 'use-subscription'
import type { Web3Plugin, Plugin, CurrencyType } from '@masknet/plugin-infra'
import {
    createConstantSubscription,
    EnhanceableSite,
    ExtensionSite,
    getSiteType,
    mapSubscription,
    StorageObject,
} from '@masknet/shared-base'

export class AccountState<
    ChainId extends number,
    ProviderType extends string,
    NetworkType extends string,
    Account extends {
        account: string
        chainId: ChainId
        providerType: ProviderType
        networkType: NetworkType
        currencyType: CurrencyType
    },
> implements Web3Plugin.ObjectCapabilities.AccountState<ChainId, ProviderType, NetworkType, Account>
{
    protected storage: StorageObject<Record<EnhanceableSite | ExtensionSite, Account>> = null!

    public allowTestnet?: Subscription<boolean>
    public chainId?: Subscription<ChainId>
    public account?: Subscription<string>
    public networkType?: Subscription<NetworkType | undefined>
    public providerType?: Subscription<ProviderType | undefined>
    public currencyType?: Subscription<CurrencyType>

    private createSubscriptionFromChainOptions<T>(getter: (value: Account) => T) {
        const siteType = getSiteType()
        if (!siteType) throw new Error(`Unknown site type: ${siteType}`)
        return mapSubscription(this.storage[siteType].subscription, getter)
    }

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: Record<EnhanceableSite | ExtensionSite, Account>,
    ) {
        const { storage } = this.context.createKVStorage('memory', defaultValue)
        this.storage = storage
        this.allowTestnet = createConstantSubscription(process.env.NODE_ENV === 'development')
        this.chainId = this.createSubscriptionFromChainOptions((x) => x.chainId)
        this.account = this.createSubscriptionFromChainOptions((x) => x.account)
        this.providerType = this.createSubscriptionFromChainOptions((x) => x.providerType)
        this.networkType = this.createSubscriptionFromChainOptions((x) => x.networkType)
        this.currencyType = this.createSubscriptionFromChainOptions((x) => x.currencyType)
    }

    async getAccount(site: EnhanceableSite | ExtensionSite) {
        return this.storage[site].value
    }

    async updateAccount(site: EnhanceableSite | ExtensionSite, options: Partial<Account>) {
        await this.storage[site].setValue({
            ...this.storage[site].value,
            ...options,
        })
    }

    async resetAccount(site: EnhanceableSite | ExtensionSite) {
        await this.updateAccount(site, this.defaultValue[site])
    }
}
