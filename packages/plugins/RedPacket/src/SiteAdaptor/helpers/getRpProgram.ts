import { Program } from '@coral-xyz/anchor'
import { getSolanaProvider } from './getSolanaProvider.js'

import type { Cluster } from '@solana/web3.js'
import idl from '../../idl/redpacket.json' with { type: 'json' }
import type { Redpacket } from '../../idl/redpacket.js'

export async function getRpProgram(cluster?: Cluster | undefined) {
    const anchorProvider = await getSolanaProvider(cluster)
    return new Program(idl as Redpacket, anchorProvider)
}