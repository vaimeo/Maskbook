import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-flow'
import { Account } from './Account'
import { AddressBook } from './AddressBook'
import { Asset } from './Asset'
import { TokenList } from './TokenList'

export type State = Web3Plugin.ObjectCapabilities.Capabilities<ChainId, ProviderType, NetworkType, unknown, unknown>

let state: State = null!

export async function setupWeb3State(context: Plugin.SNSAdaptor.SNSAdaptorContext) {
    const Account_ = new Account(context)
    state = {
        Account: Account_,
        AddressBook: new AddressBook(context, {
            chainId: Account_.chainId,
        }),
        Asset: new Asset(),
        TokenList: new TokenList(context, {
            chainId: Account_.chainId,
        }),
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

export function getWeb3State() {
    if (!state) throw new Error('Please setup state at first.')
    return state
}

export async function setWeb3State(newState: State) {
    state = newState
}
