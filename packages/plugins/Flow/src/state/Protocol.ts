import { first } from 'lodash-unified'
import type { RequestArguments, TransactionConfig } from 'web3-core'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-flow'
import { mapSubscription, StorageObject } from '@masknet/shared-base'
import type { User } from '@blocto/fcl'

export interface ProtocolStorage {
    chainId: ChainId
    user: User | null
}

export class ProtocolState implements Web3Plugin.ObjectCapabilities.ProtocolState<ChainId, {}, {}> {
    private storage: StorageObject<ProtocolStorage> = null!

    constructor(private context: Plugin.Shared.SharedContext) {
        const { storage } = context.createKVStorage('memory', {
            chainId: ChainId.Mainnet,
            user: null,
        })

        this.storage = storage
    }

    private createSubscriptionFromChainId<T>(getter: (value: ChainId) => T) {
        return mapSubscription(this.storage.chainId.subscription, getter)
    }

    private createSubscriptionFromUser<T>(getter: (value: User | null) => T) {
        return mapSubscription(this.storage.user.subscription, getter)
    }

    async getAccount() {
        return ''
    }

    async getChainId() {
        return ChainId.Mainnet
    }
}
