import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    isValidDomain,
    isSameAddress,
    ChainId,
    formatBalance,
    formatCurrency,
    formatEthereumAddress,
    getChainDetailed,
    isChainIdValid,
    NonFungibleAssetProvider,
    resolveAddressLinkOnExplorer,
    resolveBlockLinkOnExplorer,
    resolveChainColor,
    resolveChainFullName,
    resolveChainName,
    resolveCollectibleLink,
    resolveTransactionLinkOnExplorer,
    resolveDomainLink,
    formatDomainName,
} from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../../../messages'

export class UtilState {
    async create(): Promise<Web3Plugin.ObjectCapabilities.Others> {
        return {
            isChainIdValid,
            isValidDomain,
            isSameAddress,

            getLatestBalance: (chainId: ChainId, account: string) => {
                return EVM_RPC.getBalance(account, {
                    chainId,
                })
            },
            getLatestBlockNumber: (chainId: ChainId) => {
                return EVM_RPC.getBlockNumber({
                    chainId,
                })
            },
            getChainDetailed,
            getAverageBlockDelay: (chainId: ChainId) => {
                return 15 * 1000
            },

            formatAddress: formatEthereumAddress,
            formatCurrency,
            formatBalance,
            formatDomainName,

            resolveChainName,
            resolveChainFullName,
            resolveChainColor,

            resolveTransactionLink: resolveTransactionLinkOnExplorer,
            resolveAddressLink: resolveAddressLinkOnExplorer,
            resolveBlockLink: resolveBlockLinkOnExplorer,
            resolveDomainLink,
            resolveNonFungibleTokenLink: (chainId: ChainId, address: string, tokenId: string) =>
                resolveCollectibleLink(chainId as ChainId, NonFungibleAssetProvider.OPENSEA, {
                    contractDetailed: { address: address },
                    tokenId: tokenId,
                } as unknown as any),
        }
    }
}
