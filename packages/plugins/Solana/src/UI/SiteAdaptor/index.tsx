import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    NetworkType,
    ProviderType,
    SchemaType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter,
} from '@masknet/web3-shared-solana'
import { SharedPluginContext, SolanaWeb3State } from '@masknet/web3-providers'
import { base } from '../../base.js'

const site: Plugin.SiteAdaptor.Definition<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> = {
    ...base,
    async init(signal, context) {
        SharedPluginContext.setup(context)

        const state = await SolanaWeb3State.create(context)

        SolanaWeb3State.setup(state)
        site.Web3State = state
    },
}

export default site