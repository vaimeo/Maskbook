import type { Web3Plugin } from '@masknet/plugin-infra'
import {
    AddressBookState,
    AssetState,
    NameServiceState,
    PreferenceState,
    SharedState,
    TokenListState,
    TokenState,
    TransactionState,
    UtilState,
} from '../../../state'

export async function createWeb3State(signal: AbortSignal): Promise<Web3Plugin.ObjectCapabilities.Capabilities> {
    return {
        AddressBook: new AddressBookState(),
        Asset: new AssetState(),
        NameService: new NameServiceState(),
        Preference: new PreferenceState(),
        Token: new TokenState(),
        TokenList: new TokenListState(),
        Transaction: new TransactionState(),
        Shared: await new SharedState().create(),
        Utils: await new UtilState().create(),
    }
}
