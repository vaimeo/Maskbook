import type { provider as Provider } from 'web3-core'
import type { Subscription } from 'use-subscription'
import type {
    ChainId,
    ERC20TokenDetailed,
    ERC721TokenDetailed,
    ERC1155TokenDetailed,
    NonFungibleTokenDetailed,
    NetworkType,
    ProviderType,
    Asset,
    Wallet,
    FungibleAssetProvider,
    NonFungibleAssetProvider,
    Transaction,
    AddressName,
    CryptoPrice,
    BalanceOfChains,
    ERC721TokenCollectionInfo,
} from '../types'

export interface Web3ProviderType {
    allowTestnet: Subscription<boolean>
    chainId: Subscription<ChainId>
    account: Subscription<string>
    balance: Subscription<string>
    balances: Subscription<BalanceOfChains>
    blockNumber: Subscription<number>
    provider: Subscription<Provider>
    networkType: Subscription<NetworkType>
    providerType: Subscription<ProviderType>
    tokenPrices: Subscription<CryptoPrice>
    wallets: Subscription<Wallet[]>
    walletPrimary: Subscription<Wallet | null>
    erc20Tokens: Subscription<ERC20TokenDetailed[]>
    erc721Tokens: Subscription<ERC721TokenDetailed[]>
    erc1155Tokens: Subscription<ERC1155TokenDetailed[]>
    portfolioProvider: Subscription<FungibleAssetProvider>

    addToken: (token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    removeToken: (token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    trustToken: (address: string, token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>
    blockToken: (address: string, token: ERC20TokenDetailed | NonFungibleTokenDetailed) => Promise<void>

    getAssetsList: (address: string, provider: FungibleAssetProvider, network?: NetworkType) => Promise<Asset[]>
    getAssetsListNFT: (
        chainId: ChainId,
        address: string,
        provider: NonFungibleAssetProvider,
        page?: number,
        size?: number,
        collection?: string,
    ) => Promise<{ assets: ERC721TokenDetailed[]; hasNextPage: boolean }>
    getCollectionsNFT: (
        chainId: ChainId,
        address: string,
        provider: NonFungibleAssetProvider,
        page?: number,
        size?: number,
    ) => Promise<{ collections: ERC721TokenCollectionInfo[]; hasNextPage: boolean }>
    getAddressNamesList: (identity: {
        identifier: {
            userId: string
            network: string
        }
        avatar?: string
        bio?: string
        nickname?: string
        homepage?: string
    }) => Promise<AddressName[]>
    getTransactionList: (
        address: string,
        network: NetworkType,
        provider: FungibleAssetProvider,
        page?: number,
        size?: number,
    ) => Promise<{
        transactions: Transaction[]
        hasNextPage: boolean
    }>
    fetchERC20TokensFromTokenLists: (urls: string[], chainId: ChainId) => Promise<ERC20TokenDetailed[]>
}
