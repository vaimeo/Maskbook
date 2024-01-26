import { EMPTY_LIST } from '@masknet/shared-base'
import { useWallet } from '@masknet/web3-hooks-base'
import { EVMWeb3, RedPacket, TheGraphRedPacket } from '@masknet/web3-providers'
import type { RedPacketJSONPayloadFromChain } from '@masknet/web3-providers/types'
import { getRedPacketConstants, type ChainId } from '@masknet/web3-shared-evm'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { uniqBy } from 'lodash-es'

const CREATE_RED_PACKET_METHOD_ID = '0x5db05aba'

export function useRedPacketHistory(
    address: string,
    chainId: ChainId,
): UseQueryResult<RedPacketJSONPayloadFromChain[]> {
    const wallet = useWallet()
    const { HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT, HAPPY_RED_PACKET_ADDRESS_V4 } = getRedPacketConstants(chainId)
    return useQuery({
        queryKey: ['red-packet-history', chainId, address, wallet?.owner],
        queryFn: async () => {
            if (!HAPPY_RED_PACKET_ADDRESS_V4) return EMPTY_LIST as RedPacketJSONPayloadFromChain[]

            if (wallet?.owner) {
                const historyTransactions = await TheGraphRedPacket.getHistories(
                    chainId,
                    address,
                    HAPPY_RED_PACKET_ADDRESS_V4,
                )

                if (!historyTransactions) return EMPTY_LIST as RedPacketJSONPayloadFromChain[]
                return historyTransactions
            }

            const blockNumber = await EVMWeb3.getBlockNumber({ chainId })
            const payloadList = await RedPacket.getHistories(
                chainId,
                address,
                HAPPY_RED_PACKET_ADDRESS_V4,
                CREATE_RED_PACKET_METHOD_ID,
                HAPPY_RED_PACKET_ADDRESS_V4_BLOCK_HEIGHT ?? 0,
                blockNumber,
            )
            if (!payloadList) return EMPTY_LIST as RedPacketJSONPayloadFromChain[]

            return uniqBy(payloadList, (x) => x.txid)
        },
    })
}
