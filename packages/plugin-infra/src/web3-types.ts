import type { BigNumber } from 'bignumber.js'
import type { Subscription } from 'use-subscription'
import type { MaskBaseAPI } from '@masknet/web3-providers'
import type { EnhanceableSite, ExtensionSite } from '../../shared-base/src/Site'
import type { Pagination, Plugin, Pageable } from './types'

/**
 * A network plugin defines the way to connect to a single chain.
 */
export enum NetworkPluginID {
    PLUGIN_EVM = 'com.mask.evm',
    PLUGIN_FLOW = 'com.mask.flow',
    PLUGIN_SOLANA = 'com.mask.solana',
}

export enum CurrencyType {
    NATIVE = 'native',
    BTC = 'btc',
    USD = 'usd',
}

export enum TokenType {
    Fungible = 'Fungible',
    NonFungible = 'NonFungible',
}

export enum TransactionStatusType {
    NOT_DEPEND = 0,
    SUCCEED = 1,
    FAILED = 2,
    CANCELLED = 3,
}

export type Color =
    | `rgb(${number}, ${number}, ${number})`
    | `rgba(${number}, ${number}, ${number}, ${number})`
    | `#${string}${string}${string}${string}${string}${string}`
    | `#${string}${string}${string}`
    | `hsl(${number}, ${number}%, ${number}%)`

export declare namespace Web3Plugin {
    /**
     * Plugin can declare what chain it supports to trigger side effects (e.g. create a new transaction).
     * When the current chain is not supported, the composition entry will be hidden.
     */
    export type EnableRequirement = Partial<
        Record<
            NetworkPluginID,
            {
                supportedChainIds?: number[]
            }
        >
    >

    export interface NetworkDescriptor {
        /** An unique ID for each network */
        ID: string
        /** The ID of a plugin that provides the functionality of this network. */
        networkSupporterPluginID: string
        /** The chain id */
        chainId: number
        /** The network type */
        type: string
        /** The network icon */
        icon: URL
        /** The network icon in fixed color */
        iconColor: Color
        /** The network name */
        name: string
        /** Is a mainnet network */
        isMainnet: boolean
    }

    export interface ProviderDescriptor {
        /** An unique ID for each wallet provider */
        ID: string
        /** The ID of a plugin that provides the adoption of this provider. */
        providerAdaptorPluginID: string
        /** The provider type */
        type: string
        /** The provider icon */
        icon: URL
        /** The provider name */
        name: string
        /** Enable requirements */
        enableRequirements?: {
            supportedChainIds?: number[]
            supportedSNSIds?: string[]
        }
    }

    export interface ApplicationCategoryDescriptor {
        /** An unique ID for each category */
        ID: string
        /** The category icon */
        icon: URL
        /** The category name */
        name: string
    }

    export type GasPrice = Record<
        'fast' | 'normal' | 'slow',
        {
            price: number
            estimatedSeconds: number
        }
    >

    export interface CryptoPrices {
        [token: string]: {
            [key in CurrencyType]?: number
        }
    }

    export interface ChainDetailed {
        name: string
        chainId: number
        fullName?: string
        shortName?: string
        chainName?: string
        /** network name */
        network?: 'mainnet' | Omit<string, 'mainnet'>
    }

    export interface Wallet {
        id: string
        /** User define wallet name. Default address.prefix(6) */
        name: string
        /** The address of wallet */
        address: string
        /** true: Mask Wallet, false: External Wallet */
        hasStoredKeyInfo: boolean
        /** true: Derivable Wallet. false: UnDerivable Wallet */
        hasDerivationPath: boolean
        /** yep: removable, nope: unremovable */
        configurable?: boolean
        /** the derivation path when wallet was created */
        derivationPath?: string
        /** the derivation path when wallet last was derived */
        latestDerivationPath?: string
        /** the Mask SDK stored key info */
        storedKeyInfo?: MaskBaseAPI.StoredKeyInfo
        /** record created at */
        createdAt: Date
        /** record updated at */
        updatedAt: Date
    }

    export interface AddressName {
        id: string
        /** eg. vitalik.eth */
        label: string
        /** eg. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */
        ownerAddress: string
        /** eg. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 */
        resolvedAddress?: string
    }
    export interface Transaction {
        id: string
        type?: string
        filterType?: string
        from: string
        to: string
        /** unix timestamp */
        timestamp: number
        /** 0: failed 1: succeed */
        status: 0 | 1
        /** transferred tokens */
        tokens: (Token & {
            amount: string
            direction: string
        })[]
        /** estimated tx fee */
        fee?: {
            [key in CurrencyType]?: string
        }
    }

    export interface RecentTransaction {
        id: string
        chainId: number
        /** status type */
        status: TransactionStatusType
        /** record created at */
        createdAt: Date
        /** record updated at */
        updatedAt: Date
    }

    export interface Account {
        address: string
        nickname?: string
        avatarURL?: string
        link?: string
    }

    export interface Token {
        id: string
        chainId: number
        type: TokenType
        /** a sub type for casting later */
        subType: string | number
        address: string
    }

    export interface FungibleToken extends Token {
        decimals?: number
        name: string
        symbol: string
        logoURI?: string | string[]
    }

    export interface NonFungibleToken extends Token {
        tokenId: string
        metadata?: {
            name?: string
            symbol?: string
            description?: string
            tokenURI?: string
            mediaURL?: string
            imageURL?: string
        }
        contract?: {
            /** a type for casting later */
            type: string | number
            chainId: number
            address: string
            name: string
            symbol: string
            baseURI?: string
            iconURL?: string
            balance?: number
        }
        collection?: {
            name: string
            slug: string
            description?: string
            iconURL?: string
            /** verified by provider */
            verified?: boolean
            /** unix timestamp */
            createdAt?: number
        }
    }

    /**
     * A fungible token but with more metadata
     */
    export interface FungibleAsset extends FungibleToken {
        /** currently balance */
        balance: string
        /** estimated price */
        price?: {
            [key in CurrencyType]?: string
        }
        /** estimated value */
        value?: {
            [key in CurrencyType]?: string
        }
    }

    /**
     * A non-fungible token but with more metadata
     */
    export interface NonFungibleAsset extends NonFungibleToken {
        /** the creator data */
        creator?: Account
        /** the owner data */
        owner?: Account
        /** estimated price */
        price?: {
            [key in CurrencyType]?: string
        }
        /** traits of the digital asset */
        traits?: {
            type?: string
            value?: string
        }[]
        /** token on auction */
        auction?: {
            isAuction: boolean
            /** unix timestamp */
            startAt?: number
            /** unix timestamp */
            endAt?: number
            /** tokens available to make an order */
            orderTokens?: FungibleToken[]
            /** tokens available to make an offer */
            offerTokens?: FungibleToken[]
        }
        orders?: {
            quantity: number
            /** buy or sell */
            side?: string | number
            /** the account make the order */
            maker?: Account
            /** the account fullfil the order */
            taker?: Account
            /** unix timestamp */
            createdAt?: number
            /** unix timestamp */
            expiredAt?: number
            /** current price */
            price?: {
                [key in CurrencyType]?: string
            }
            paymentToken?: FungibleToken
        }[]
        events?: {
            type: string
            /** unix timestamp */
            timestamp: number
            /** relate token price */
            price?: {
                [key in CurrencyType]?: string
            }
            paymentToken?: FungibleToken
        }[]
    }

    export interface TokenList {
        name: string
        description?: string
        /** fungile or non-fungile tokens */
        tokens: Token[]
    }

    export namespace ObjectCapabilities {
        export interface AccountState<
            ChainId,
            ProviderType,
            NetworkType,
            Account = {
                account: string
                chainId: ChainId
                currencyType: CurrencyType
                providerType: ProviderType
                networkType: NetworkType
            },
        > {
            /** Is testnets valid */
            allowTestnet?: Subscription<boolean>
            /** The ID of currently chosen sub-network. */
            chainId?: Subscription<ChainId>
            /** The address of the currently chosen wallet. */
            account?: Subscription<string>
            /** The network type. */
            networkType?: Subscription<NetworkType | undefined>
            /** The wallet provider type. */
            providerType?: Subscription<ProviderType | undefined>
            /** The currency of estimated values and prices. */
            currencyType?: Subscription<CurrencyType>

            updateAccount?: (site: EnhanceableSite | ExtensionSite, options: Partial<Account>) => Promise<void>
            resetAccount?: (site: EnhanceableSite | ExtensionSite) => Promise<void>
        }
        export interface AddressBookState<ChainId> {
            /** The tracked addresses of currently chosen sub-network */
            addressBook?: Subscription<string[]>

            addAddress: (chainId: ChainId, address: string) => Promise<void>
            removeAddress: (chainId: ChainId, address: string) => Promise<void>
        }
        export interface AssetState<ChainId> {
            /** Get fungible assets of given account. */
            getFungibleAssets?: (
                chainId: ChainId,
                address: string,
                pagination?: Pagination,
            ) => Promise<Pageable<FungibleAsset>>
            /** Get non-fungible assets of given account. */
            getNonFungibleAssets?: (
                chainId: ChainId,
                address: string,
                pagination?: Pagination,
            ) => Promise<Pageable<NonFungibleAsset>>
        }
        export interface NameServiceState<ChainId, DomainBook = Record<string, string>> {
            /** The tracked domains of currently chosen sub-network */
            domainBook?: Subscription<DomainBook>

            /** get address of domain name */
            lookup?: (chainId: ChainId, domain: string) => Promise<string | undefined>
            /** get domain name of address */
            reverse?: (chainId: ChainId, address: string) => Promise<string | undefined>
        }
        export interface TokenPriceState<ChainId> {
            /** The tracked token prices which stored as address and price pairs. */
            tokenPrices?: Subscription<CryptoPrices>

            /** get price of a token */
            getTokenPrice?: (chainId: ChainId, currency: CurrencyType, id: string) => CryptoPrices[keyof CryptoPrices]
            /** get prices of tokens */
            getTokenPrices?: (chainId: ChainId, currency: CurrencyType, ids: string[]) => CryptoPrices
        }
        export interface TokenListState<ChainId> {
            /** The tracked fungible token list of currently chosen sub-network */
            fungibleTokens?: Subscription<FungibleToken[]>
            /** The tracked non-fungible token list of currently chosen sub-network */
            nonFungibleTokens?: Subscription<NonFungibleToken[]>

            /** Get the fungible token list. */
            getFungibleTokens?: (chainId: ChainId) => Promise<FungibleToken[]>
            /** Get the non-fungible token list. */
            getNonFungibleTokens?: (chainId: ChainId) => Promise<NonFungibleToken[]>
        }
        export interface TokenState {
            /** The user added fungible tokens. */
            fungibleTokens?: Subscription<FungibleToken[]>
            /** The user added non-fungible tokens. */
            nonFungibleTokens?: Subscription<NonFungibleToken[]>

            addToken?: (token: Token) => Promise<void>
            removeToken?: (token: Token) => Promise<void>
            trustToken?: (address: string, token: Token) => Promise<void>
            blockToken?: (address: string, token: Token) => Promise<void>
        }
        export interface TransactionState<ChainId, TransactionConfig> {
            /** The tracked transactions of currently chosen sub-network */
            transactions?: Subscription<RecentTransaction[]>

            addTransaction?: (
                chainId: ChainId,
                address: string,
                id: string,
                transaction: TransactionConfig,
            ) => Promise<void>
            replaceTransaction?: (
                chainId: ChainId,
                address: string,
                id: string,
                newId: string,
                transaction: TransactionConfig,
            ) => Promise<void>
            updateTransaction?: (
                chainId: ChainId,
                address: string,
                id: string,
                status: Exclude<TransactionStatusType, TransactionStatusType.NOT_DEPEND>,
            ) => Promise<void>
            removeTransaction?: (chainId: ChainId, address: string, id: string) => Promise<void>
            /** clear all transactions relate to account under given chain */
            clearTransactions?: (chainId: ChainId, address: string) => Promise<void>
        }
        export interface ProtocolState<ChainId, RequestArguments, TransactionConfig> {
            /** Get the current account */
            getAccont?: () => Promise<string>
            /** Get the current chain id */
            getChainId?: () => Promise<ChainId>
            /** Get the latest block height of chain */
            getLatestBlockNumber?: (chainId: ChainId) => Promise<number>
            /** Get the latest balance of account */
            getLatestBalance?: (chainId: ChainId, account: string) => Promise<string>
            /** Get transaction status */
            getTransactionStatus?: (chainId: ChainId, id: string) => Promise<TransactionStatusType>
            /** Sign a plain message, some chain support multiple sign methods */
            signMessage?: (address: string, message: string, signType?: string) => Promise<string>
            /** Sign a transaction, and the result could send as a raw transaction */
            signTransaction?: (address: string, transaction: TransactionConfig) => Promise<string>
            /** Send transaction and get tx id */
            sendTransaction?: (chainId: ChainId, transaction: TransactionConfig) => Promise<string>
            /** Send raw transaction and get tx id */
            sendRawTransaction?: (chainid: ChainId, rawTransaction: string) => Promise<string>
            /** Send (raw) transaction and wait until it confirmed */
            sendAndConfirmTransaction?: (chainId: ChainId, transaction: string | TransactionConfig) => Promise<string>
        }
        export interface WalletState {
            /** The currently stored wallet by MaskWallet. */
            wallets?: Subscription<Wallet[]>
            /** The default derivable wallet. */
            walletPrimary?: Subscription<Wallet | null>

            addWallet?: (id: string, wallet: Web3Plugin.Wallet) => Promise<void>
            removeWallet?: (id: string) => Promise<void>
            getAllWallets?: () => Promise<Wallet[]>
        }
        export interface Others<ChainId> {
            /** detect if a chain id is supported  */
            isChainIdValid?: (chainId: ChainId, allowTestnet: boolean) => boolean
            /** detect if a domain is valid */
            isValidDomain?: (domain: string) => boolean
            /** detect if an address is valid */
            isValidAddress?: (address: string) => boolean
            /** compare two addresses */
            isSameAddress?: (address?: string, otherAddress?: string) => boolean

            getChainDetailed?: (chainId: ChainId) => ChainDetailed | undefined
            getAverageBlockDelay?: (chainId: ChainId, scale?: number) => number

            formatAddress?: (address: string, size?: number) => string
            formatCurrency?: (value: BigNumber.Value, sign?: string, symbol?: string) => string
            formatBalance?: (value: BigNumber.Value, decimals?: number, significant?: number) => string
            formatDomainName?: (domain?: string, size?: number) => string | undefined

            /** chain customization */
            resolveChainName?: (chainId: ChainId) => string
            resolveChainColor?: (chainId: ChainId) => string
            resolveChainFullName?: (chainId: ChainId) => string

            /** explorer */
            resolveTransactionLink?: (chainId: ChainId, id: string) => string
            resolveAddressLink?: (chainId: ChainId, address: string) => string
            resolveBlockLink?: (chainId: ChainId, blockNumber: string) => string
            resolveDomainLink?: (domain: string) => string
            resolveFungibleTokenLink?: (chainId: ChainId, address: string) => string
            resolveNonFungibleTokenLink?: (chainId: ChainId, address: string, tokenId: string) => string
        }
        export interface Capabilities<
            ChainId = number,
            ProviderType = string,
            NetworkType = string,
            RequestArguments = unknown,
            TransactionConfig = unknown,
        > {
            Account?: AccountState<ChainId, ProviderType, NetworkType>
            AddressBook?: AddressBookState<ChainId>
            Asset?: AssetState<ChainId>
            NameService?: NameServiceState<ChainId>
            Token?: TokenState
            TokenPrice?: TokenPriceState<ChainId>
            TokenList?: TokenListState<ChainId>
            Transaction?: TransactionState<ChainId, TransactionConfig>
            Protocol?: ProtocolState<ChainId, RequestArguments, TransactionConfig>
            Wallet?: WalletState
            Utils?: Others<ChainId>
        }
    }
    export namespace UI {
        export interface NetworkIconClickBaitProps {
            network: NetworkDescriptor
            provider?: ProviderDescriptor
            children?: React.ReactNode
            onClick?: (network: NetworkDescriptor, provider?: ProviderDescriptor) => void
            onSubmit?: (network: NetworkDescriptor, provider?: ProviderDescriptor) => void
        }
        export interface ProviderIconClickBaitProps {
            network: NetworkDescriptor
            provider: ProviderDescriptor
            children?: React.ReactNode
            onClick?: (network: NetworkDescriptor, provider: ProviderDescriptor) => void
            onSubmit?: (network: NetworkDescriptor, provider: ProviderDescriptor) => void
        }
        export interface ApplicationCategoryIconClickBaitProps {
            category: ApplicationCategoryDescriptor
        }
        export interface AddressFormatterProps {
            address: string
            size?: number
        }
        export interface UI {
            SelectNetworkMenu?: {
                /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
                NetworkIconClickBait?: Plugin.InjectUIReact<UI.NetworkIconClickBaitProps>
            }
            SelectProviderDialog?: {
                /** This UI will receive network icon as children component, and the plugin may hook click handle on it. */
                NetworkIconClickBait?: Plugin.InjectUIReact<UI.NetworkIconClickBaitProps>
                /** This UI will receive provider icon as children component, and the plugin may hook click handle on it. */
                ProviderIconClickBait?: Plugin.InjectUIReact<UI.ProviderIconClickBaitProps>
            }
            WalletStatusDialog?: {
                /** This UI will receive application category icon as children component, and the plugin may hook click handle on it. */
                ApplicationCategoryIconClickBait?: Plugin.InjectUIReact<UI.ApplicationCategoryIconClickBaitProps>
            }
        }
    }
}
