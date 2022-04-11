import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import { Plugin, TokenListState, Web3Plugin } from '@masknet/plugin-infra'
import { TokenList as TokenListAPI } from '@masknet/web3-providers'
import { ChainId, getTokenListConstants } from '@masknet/web3-shared-evm'

export class TokenList extends TokenListState<ChainId> {
    constructor(
        protected override context: Plugin.Shared.SharedContext,
        protected override subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue = getEnumAsArray(ChainId).reduce((accumualtor, chainId) => {
            accumualtor.fungibleTokens = {
                ...accumualtor.fungibleTokens,
                [chainId.value]: [],
            }
            accumualtor.nonFungibleTokens = {
                ...accumualtor.nonFungibleTokens,
                [chainId.value]: [],
            }
            return accumualtor
        }, {} as Record<'fungibleTokens' | 'nonFungibleTokens', Record<ChainId, Web3Plugin.Token[]>>)

        super(context, defaultValue, subscriptions)
    }

    override async getFungibleTokenLists(chainId: ChainId) {
        const tokenListCached = await super.getFungibleTokenLists(chainId)
        if (tokenListCached) return tokenListCached

        const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)
        super.setTokenList(
            chainId,
            await TokenListAPI.fetchFungibleTokensFromTokenLists(chainId, FUNGIBLE_TOKEN_LISTS),
            'fungible',
        )
        return super.getFungibleTokenLists(chainId)
    }
}
