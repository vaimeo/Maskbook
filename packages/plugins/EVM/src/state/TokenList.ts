import type { Web3Plugin } from '@masknet/plugin-infra'
import { TokenList as TokenListAPI } from '@masknet/web3-providers'
import { ChainId, getTokenListConstants } from '@masknet/web3-shared-evm'

export class TokenListState implements Web3Plugin.ObjectCapabilities.TokenListState {
    async getFungibleTokenLists(chainId: ChainId) {
        const { FUNGIBLE_TOKEN_LISTS = [] } = getTokenListConstants(chainId)
        return {
            name: '',
            description: '',
            tokens: await TokenListAPI.fetchFungibleTokensFromTokenLists(chainId, FUNGIBLE_TOKEN_LISTS),
        }
    }
}
