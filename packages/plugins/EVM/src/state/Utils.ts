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
import { EVM_RPC } from '../messages'

export class UtilState implements Web3Plugin.ObjectCapabilities.Others<ChainId> {
    isChainIdValid = isChainIdValid
    isValidDomain = isValidDomain
    isSameAddress = isSameAddress
    getLatestBalance = (chainId: ChainId, account: string) => {
        return EVM_RPC.getBalance(account, {
            chainId,
        })
    }
    getLatestBlockNumber = (chainId: ChainId) => {
        return EVM_RPC.getBlockNumber({
            chainId,
        })
    }
    getChainDetailed = getChainDetailed
    getAverageBlockDelay = (chainId: ChainId) => {
        return 15 * 1000
    }

    formatAddress = formatEthereumAddress
    formatCurrency = formatCurrency
    formatBalance = formatBalance
    formatDomainName = formatDomainName

    resolveChainName = resolveChainName
    resolveChainFullName = resolveChainFullName
    resolveChainColor = resolveChainColor

    resolveTransactionLink = resolveTransactionLinkOnExplorer
    resolveAddressLink = resolveAddressLinkOnExplorer
    resolveBlockLink = resolveBlockLinkOnExplorer
    resolveDomainLink = resolveDomainLink
    resolveNonFungibleTokenLink = (chainId: ChainId, address: string, tokenId: string) =>
        resolveCollectibleLink(chainId as ChainId, NonFungibleAssetProvider.OPENSEA, {
            // @ts-ignore
            contractDetailed: { address },
            tokenId,
        })
}
