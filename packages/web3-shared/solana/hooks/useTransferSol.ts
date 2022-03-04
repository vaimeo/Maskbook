import type BigNumber from 'bignumber.js'
import { SystemProgram, PublicKey, Transaction } from '@solana/web3.js'
import { useCallback } from 'react'
import { bridgedSolanaProvider as solana } from '@masknet/injected-script'

interface TransferOptions {
    fromPubkey: string
    toPubkey: string
    lampports: BigNumber
}
export function useTransferSol(initOptions: Partial<TransferOptions> = {}) {
    const transfer = useCallback(async (options: Partial<TransferOptions>) => {
        const { fromPubkey, toPubkey, lampports } = { ...initOptions, ...options }
        if (!fromPubkey || !toPubkey || !lampports) return
        const transaction = new Transaction()
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(fromPubkey),
                toPubkey: new PublicKey(toPubkey),
                lamports: lampports.toNumber(),
            }),
        )
        const { signature } = await solana.signAndSendTransaction(transaction)
        await solana.confirmTransaction(signature)
    }, [])

    return transfer
}
