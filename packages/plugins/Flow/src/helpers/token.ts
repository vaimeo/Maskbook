import { CurrencyType, TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { leftShift, multipliedBy } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-flow'

export function createFungibleToken(
    chainId: ChainId,
    address: string,
    name: string,
    symbol: string,
    decimals: number,
    logoURI?: string,
): Web3Plugin.FungibleToken {
    return {
        id: address,
        chainId,
        type: TokenType.Fungible,
        subType: TokenType.Fungible,
        address,
        name,
        symbol,
        decimals,
        logoURI,
    }
}

export function createFungibleAsset(
    token: Web3Plugin.FungibleToken,
    balance: string,
    price?: { [key in CurrencyType]?: string },
): Web3Plugin.FungibleAsset {
    return {
        ...token,
        balance: leftShift(balance, 8).toFixed(),
        price,
        value: {
            [CurrencyType.USD]: multipliedBy(price?.usd ?? 0, leftShift(balance, 8)).toFixed(),
        },
    }
}
