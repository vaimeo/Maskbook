import type { Subscription } from 'use-subscription'
import { mapSubscription, mergeSubscription, StorageItem } from '@masknet/shared-base'
import { Plugin, TransactionStatusType, Web3Plugin } from '@masknet/plugin-infra'

export type TransactionStorage<ChainId extends number, TransactionConfig> = Record<
    // chainId
    ChainId,
    Partial<
        Record<
            // address
            string,
            (Web3Plugin.RecentTransaction & {
                candidates: Record<
                    // transaction id
                    string,
                    TransactionConfig
                >
            })[]
        >
    >
>

export class TransactionState<ChainId extends number, TransactionConfig>
    implements Web3Plugin.ObjectCapabilities.TransactionState<ChainId, TransactionConfig>
{
    static MAX_RECORD_SIZE = 20

    protected storage: StorageItem<TransactionStorage<ChainId, TransactionConfig>> = null!
    public transactions?: Subscription<Web3Plugin.RecentTransaction[]>

    constructor(
        protected context: Plugin.Shared.SharedContext,
        protected defaultValue: TransactionStorage<ChainId, TransactionConfig>,
        protected subscriptions: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
        },
        protected options: {
            formatAddress(a: string): string
        },
    ) {
        const { storage } = this.context.createKVStorage('persistent', {
            value: defaultValue,
        })
        this.storage = storage.value

        if (this.subscriptions.chainId && this.subscriptions.account) {
            this.transactions = mapSubscription(
                mergeSubscription<[ChainId, string, TransactionStorage<ChainId, TransactionConfig>]>(
                    this.subscriptions.chainId,
                    this.subscriptions.account,
                    this.storage.subscription,
                ),
                ([chainId, account, transactionStorage]) => transactionStorage[chainId][account] ?? [],
            )
        }
    }

    async addTransaction(chainId: ChainId, address: string, id: string, transaction: TransactionConfig) {
        const now = new Date()
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        // to ensure that the transaction doesn't exist
        const transaction_ = all[chainId][address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (transaction_) return

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: [
                    // new records go first then we will remove it last
                    {
                        chainId,
                        id,
                        createdAt: now,
                        updatedAt: now,
                        status: TransactionStatusType.NOT_DEPEND,
                        candidates: {
                            [id]: transaction as TransactionConfig,
                        },
                    },
                    ...(all[chainId][address_] ?? []),
                ].slice(0, TransactionState.MAX_RECORD_SIZE),
            },
        })
    }

    async replaceTransaction(
        chainId: ChainId,
        address: string,
        id: string,
        newId: string,
        transaction: TransactionConfig,
    ) {
        const now = new Date()
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        // to ensure that the transaction exists
        const transaction_ = all[chainId][address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (!transaction_) return

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: (all[chainId][address] ?? []).map((x) =>
                    Object.keys(x.candidates).includes(id)
                        ? {
                              ...x,
                              candidates: {
                                  ...x.candidates,
                                  [newId]: transaction,
                              },
                              updatedAt: now,
                          }
                        : x,
                ),
            },
        })
    }

    async updateTransaction(
        chainId: ChainId,
        address: string,
        id: string,
        status: Exclude<TransactionStatusType, TransactionStatusType.NOT_DEPEND>,
    ) {
        const now = new Date()
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        // to ensure that the transaction exists
        const transaction_ = all[chainId][address_]?.find((x) => Object.keys(x.candidates).includes(id))
        if (!transaction_) return

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: (all[chainId][address] ?? []).map((x) =>
                    Object.keys(x.candidates).includes(id)
                        ? {
                              ...x,
                              status,
                              updatedAt: now,
                          }
                        : x,
                ),
            },
        })
    }

    async removeTransaction(chainId: ChainId, address: string, id: string) {
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: all[chainId][address_]?.filter((x) => !Object.keys(x.candidates).includes(id)),
            },
        })
    }

    async clearTransactions(chainId: ChainId, address: string) {
        const all = this.storage.value
        const address_ = this.options.formatAddress(address)

        await this.storage.setValue({
            ...all,
            [chainId]: {
                ...all[chainId],
                [address_]: [],
            },
        })
    }
}
