import ENS from 'ethjs-ens'
import type { Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, createExternalProvider, isSameAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { EVM_RPC } from '../messages'
import { getStorageValue, setStorageValue } from '../storage'

export class NameServiceState implements Web3Plugin.ObjectCapabilities.NameServiceState {
    private provider = createExternalProvider(EVM_RPC.request, () => ({
        chainId: ChainId.Mainnet,
    }))

    private ens = new ENS({
        provider: this.provider,
        network: ChainId.Mainnet,
    })

    static ZERO_X_ERROR_ADDRESS = '0x'

    private async getDomainBook(chainId: ChainId, addressOrDomain: string) {
        const domainAddressBook = await getStorageValue('memory', 'domainBook')
        return domainAddressBook[chainId]?.[addressOrDomain]
    }

    private async setDomainBook(chainId: ChainId, addressOrDomain: string, domainOrAddress: string) {
        return setStorageValue('memory', 'domainBook', {
            [chainId]: {
                [addressOrDomain]: domainOrAddress,
                [domainOrAddress]: addressOrDomain,
            },
        })
    }

    async lookup(chainId: ChainId, domain: string) {
        if (chainId !== ChainId.Mainnet) return

        const cachedAddress = await this.getDomainBook(chainId, domain)
        if (cachedAddress && isValidAddress(cachedAddress)) return cachedAddress

        const address = await this.ens.lookup(domain)

        if (
            isZeroAddress(address) ||
            !isValidAddress(address) ||
            isSameAddress(address, NameServiceState.ZERO_X_ERROR_ADDRESS)
        )
            return

        // set cache
        if (address) await this.setDomainBook(chainId, domain, address)

        return address
    }

    async reverse(chainId: ChainId, address: string) {
        if (chainId !== ChainId.Mainnet) return
        if (!isValidAddress(address)) return

        const cachedDomain = await this.getDomainBook(chainId, address)
        if (cachedDomain) return cachedDomain

        const domain = await this.ens.reverse(address)

        if (!domain || isZeroAddress(domain) || isSameAddress(domain, NameServiceState.ZERO_X_ERROR_ADDRESS)) return

        // set cache
        await this.setDomainBook(chainId, address, domain)

        return domain
    }
}
