import { bridgedSolanaProvider as solana } from '@masknet/injected-script'
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import type BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import bs58 from 'bs58'
import { getClusterId } from '../helpers'
import { ChainId } from '../types'

interface TransferOptions {
    fromPubkey: string
    toPubkey: string
    lampports: BigNumber
}
export function useTransferSol(initOptions: Partial<TransferOptions> = {}) {
    const transfer = useCallback(async (options: Partial<TransferOptions>) => {
        const { fromPubkey, toPubkey, lampports } = { ...initOptions, ...options }
        if (!fromPubkey || !toPubkey || !lampports) return
        const clusterId = getClusterId(ChainId.Devnet)
        const connection = new Connection(clusterApiUrl(clusterId), 'confirmed')

        const transaction = new Transaction({
            feePayer: new PublicKey(fromPubkey),
            recentBlockhash: (await connection.getRecentBlockhash('confirmed')).blockhash,
        })
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(fromPubkey),
                toPubkey: new PublicKey(toPubkey),
                lamports: lampports.toNumber(),
            }),
        )
        const { publicKey, signature } = await solana.signAndSendTransaction(transaction)
        transaction.addSignature(new PublicKey(publicKey), bs58.decode(signature))
        await connection.confirmTransaction(signature)
    }, [])

    return transfer
}
