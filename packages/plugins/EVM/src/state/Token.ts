import { uniqBy } from 'lodash-unified'
import { TokenType, Web3Plugin } from '@masknet/plugin-infra'
import { formatEthereumAddress, isSameAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { getStorageValue, setStorageValue } from '../storage'

export class TokenState implements Web3Plugin.ObjectCapabilities.TokenState {
    private async addOrRemoveToken(token: Web3Plugin.Token, strategy: 'add' | 'remove') {
        if (isValidAddress(token.address)) throw new Error('Not a valid token.')

        const key = token.type === TokenType.Fungible ? 'fungibleTokens' : 'nonFungibleTokens'
        const tokens = (await getStorageValue('persistent', key)) as Web3Plugin.Token[]

        const address = formatEthereumAddress(token.address)
        const tokens_ =
            strategy === 'add'
                ? uniqBy(
                      [
                          {
                              ...token,
                              id: address,
                              address,
                          },
                          ...tokens,
                      ],
                      (x) => x.id,
                  )
                : tokens.filter((x) => !isSameAddress(x.address, address))

        // @ts-ignore
        await setStorageValue('persistent', key, tokens_)
    }

    private async blockOrUnblockToken(address: string, token: Web3Plugin.Token, strategy: 'trust' | 'block') {
        if (isValidAddress(token.address)) throw new Error('Not a valid token.')

        const key = token.type === TokenType.Fungible ? 'fungibleTokenBlockedBy' : 'nonFungibleTokenBlockedBy'
        const blocked = await getStorageValue('persistent', key)

        const address_ = formatEthereumAddress(address)
        const blocked_ = {
            ...blocked,
            [address_]:
                strategy === 'block'
                    ? uniqBy([formatEthereumAddress(token.address), ...(blocked[address_] ?? [])], (x) =>
                          x.toLowerCase(),
                      )
                    : blocked[address_]?.filter((x) => !isSameAddress(x, token.address)),
        }

        await setStorageValue('persistent', key, blocked_)
    }

    async addToken(token: Web3Plugin.Token) {
        this.addOrRemoveToken(token, 'add')
    }
    async removeToken(token: Web3Plugin.Token) {
        this.addOrRemoveToken(token, 'remove')
    }
    async trustToken(address: string, token: Web3Plugin.Token) {
        this.blockOrUnblockToken(address, token, 'trust')
    }
    async blockToken(address: string, token: Web3Plugin.Token) {
        this.blockOrUnblockToken(address, token, 'block')
    }
}
