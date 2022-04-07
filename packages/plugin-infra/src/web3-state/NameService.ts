import type { Subscription } from 'use-subscription'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import { mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'

export class NameServiceState<ChainId extends number>
    implements Web3Plugin.ObjectCapabilities.NameServiceState<ChainId>
{
    protected storage: StorageItem<Record<ChainId, Record<string, string>>> = null!
    public domainBook?: Subscription<Record<string, string>>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: Record<ChainId, Record<string, string>>,
        protected subscriptions: {
            chainId?: Subscription<ChainId>
        },
        protected options: {
            isValidName(a: string): boolean
            isValidAddress(a: string): boolean
            formatAddress(a: string): string
        },
    ) {
        const { storage } = context.createKVStorage('memory', {
            value: defaultValue,
        })
        this.storage = storage.value

        if (this.subscriptions.chainId) {
            this.domainBook = mapSubscription(
                mergeSubscription<[ChainId, Record<ChainId, Record<string, string>>]>(
                    this.subscriptions.chainId,
                    this.storage.subscription,
                ),
                ([chainId, domainBook]) => domainBook[chainId],
            )
        }
    }

    async addName(chainId: ChainId, address: string, name: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [this.options.formatAddress(address)]: name,
            },
        })
    }

    async addAddress(chainId: ChainId, name: string, address: string) {
        if (!this.options.isValidAddress(address)) return
        const all = this.storage.value
        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [name]: this.options.formatAddress(address),
            },
        })
    }

    async lookup(chainId: ChainId, name: string) {
        const address = this.storage.value[chainId][name]
        if (!this.options.isValidAddress(address)) return
        return address
    }

    async reverse(chainId: ChainId, address: string) {
        if (!this.options.isValidAddress(address)) return
        return this.storage.value[chainId][this.options.formatAddress(address)]
    }
}
