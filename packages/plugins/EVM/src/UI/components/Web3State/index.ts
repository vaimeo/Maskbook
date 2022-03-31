import type { Web3Plugin } from '@masknet/plugin-infra'
import { AddressBookState } from './AddressBook'
import { NameServiceState } from './NameService'
import { TokenListState } from './TokenList'
import { SharedState } from './Shared'
import { UtilState } from './Utils'
import { AssetState } from './Asset'

export async function createWeb3State(signal: AbortSignal): Promise<Web3Plugin.ObjectCapabilities.Capabilities> {
    return {
        AddressBook: new AddressBookState(),
        NameService: new NameServiceState(),
        TokenList: new TokenListState(),
        Asset: new AssetState(),
        Shared: await new SharedState().create(),
        Utils: await new UtilState().create(),
    }
}
