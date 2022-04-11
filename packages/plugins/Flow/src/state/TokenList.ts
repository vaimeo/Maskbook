import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import { Plugin, TokenListState, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-flow'

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

    private composeFungibleTokenList(chainId: ChainId): Web3Plugin.FungibleToken[] {
        const { FLOW_ADDRESS = '', FUSD_ADDRESS = '', TETHER_ADDRESS = '' } = getTokenConstants(chainId)
        return [
            {
                id: FLOW_ADDRESS,
                type: TokenType.Fungible,
                subType: TokenType.Fungible,
                chainId,
                name: 'Flow',
                symbol: 'FLOW',
                address: FLOW_ADDRESS,
                decimals: 8,
                logoURI: new URL('../assets/flow.png', import.meta.url).toString(),
            },
            {
                id: FUSD_ADDRESS,
                type: TokenType.Fungible,
                subType: TokenType.Fungible,
                chainId,
                name: 'Flow USD',
                symbol: 'FUSD',
                address: FUSD_ADDRESS,
                decimals: 8,
                logoURI: new URL('../assets/FUSD.png', import.meta.url).toString(),
            },
            {
                id: TETHER_ADDRESS,
                type: TokenType.Fungible,
                subType: TokenType.Fungible,
                chainId,
                name: 'Tether USD',
                symbol: 'tUSD',
                address: TETHER_ADDRESS,
                decimals: 8,
                logoURI: new URL('../assets/tUSD.png', import.meta.url).toString(),
            },
        ]
    }

    override async getFungibleTokenLists(chainId: ChainId) {
        const tokenListCached = await super.getFungibleTokenLists(chainId)
        if (tokenListCached) return tokenListCached

        super.setTokenList(chainId, this.composeFungibleTokenList(chainId) as Web3Plugin.Token[], 'fungible')
        return super.getFungibleTokenLists(chainId)
    }
}
