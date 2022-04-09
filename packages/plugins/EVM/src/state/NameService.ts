import ENS from 'ethjs-ens'
import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import { NameServiceState, Plugin } from '@masknet/plugin-infra'
import {
    ChainId,
    createExternalProvider,
    formatEthereumAddress,
    isValidAddress,
    isZeroAddress,
} from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'

export class NameService extends NameServiceState<ChainId> {
    private provider = createExternalProvider(EVM_RPC.request, () => ({
        chainId: ChainId.Mainnet,
    }))

    private ens = new ENS({
        provider: this.provider,
        network: ChainId.Mainnet,
    })

    constructor(
        protected override context: Plugin.Shared.SharedContext,
        protected override subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue = getEnumAsArray(ChainId).reduce((accumulator, chainId) => {
            accumulator[chainId.value] = {}
            return accumulator
        }, {} as Record<ChainId, Record<string, string>>)

        super(context, defaultValue, subscriptions, {
            isValidName: (x) => x !== '0x',
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress: formatEthereumAddress,
        })
    }

    override async lookup(chainId: ChainId, name: string) {
        if (chainId !== ChainId.Mainnet) return

        const cachedAddress = await super.lookup(chainId, name)
        if (cachedAddress) return cachedAddress

        await super.addAddress(chainId, name, await this.ens.lookup(name))
        return super.lookup(chainId, name)
    }

    override async reverse(chainId: ChainId, address: string) {
        if (chainId !== ChainId.Mainnet) return

        const cachedDomain = await super.reverse(chainId, address)
        if (cachedDomain) return cachedDomain

        await super.addName(chainId, address, await this.ens.reverse(address))
        return super.reverse(chainId, address)
    }
}
