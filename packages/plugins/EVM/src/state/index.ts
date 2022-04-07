import type { RequestArguments } from 'web3-core'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import type { ChainId, EthereumTransactionConfig, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import { AddressBook } from './AddressBook'
import { AssetState } from './Asset'
import { Account } from './Account'
import { Token } from './Token'
import { TokenListState } from './TokenList'
import { Transaction } from './Transaction'
import { NameService } from './NameService'
import { ProtocolState } from './Protocol'
import { WalletState } from './Wallet'
import { UtilState } from './Utils'

export type State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    RequestArguments,
    EthereumTransactionConfig
>

let state: State = null!

export async function setupState(context: Plugin.SNSAdaptor.SNSAdaptorContext) {
    const Account_ = new Account(context, state)
    state = {
        Account: Account_,
        AddressBook: new AddressBook(context, {
            chainId: Account_.chainId,
        }),
        Asset: new AssetState(),
        NameService: new NameService(context, {
            chainId: Account_.chainId,
        }),
        Token: new Token(context, {
            account: Account_.account,
        }),
        TokenList: new TokenListState(),
        Transaction: new Transaction(context, {
            chainId: Account_.chainId,
            account: Account_.account,
        }),
        Protocol: new ProtocolState(context),
        Wallet: new WalletState(context),
        Utils: new UtilState(),
    }

    return state
}

export function getState() {
    if (!state) throw new Error('Please setup state at first.')
    return state
}

export async function setState(newState: State) {
    state = newState
}
