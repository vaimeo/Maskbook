import type { Pageable, Pagination, Web3Plugin } from '@masknet/plugin-infra'
import { OpenSea, NFTScan, DeBank, Zerion } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'

export class AssetState implements Web3Plugin.ObjectCapabilities.AssetState {
    async getFungibleAssets(address: string, pagination?: Pagination) {
        let assets: Web3Plugin.FungibleAsset[] = []
        try {
            assets = await DeBank.getAssets(address)
        } catch {
            assets = await Zerion.getAssets(address)
        }
        return {
            data: assets,
            hasNextPage: false,
        }
    }

    async getNonFungibleAssets(chainId: ChainId, address: string, pagination?: Pagination) {
        try {
            return OpenSea.getTokens(address, {
                chainId,
                ...pagination,
            })
        } catch {
            return NFTScan.getTokens(address, {
                chainId,
                ...pagination,
            })
        }
    }
}
