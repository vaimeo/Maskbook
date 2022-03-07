import type { Cluster } from '@solana/web3.js'
import { ChainId } from '../types'

const clusterMap: Record<ChainId, Cluster> = {
    [ChainId.Mainnet]: 'mainnet-beta',
    [ChainId.Devnet]: 'devnet',
    [ChainId.Testnet]: 'testnet',
}

export function getClusterId(chainId: ChainId) {
    return clusterMap[chainId]
}
