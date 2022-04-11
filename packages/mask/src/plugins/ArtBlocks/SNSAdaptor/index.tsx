import { type Plugin, usePluginWrapper, usePostInfoDetails } from '@masknet/plugin-infra/content-script'
import { uniq } from 'lodash-unified'
import { checkUrl, getAssetInfoFromURL, getRelevantUrl } from '../utils'

import { base } from '../base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import { Collectible } from './Collectible'
import type { ChainId } from '@masknet/web3-shared-evm'
import { EthereumChainBoundary } from '../../../web3/UI/EthereumChainBoundary'
import { ArtBlocksIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    PostInspector: function Component() {
        const links = usePostInfoDetails.mentionedLinks()
        const link = uniq(links).find(checkUrl)
        const asset = getAssetInfoFromURL(link)

        return asset ? <Renderer chainId={asset?.chain_id} projectId={asset.project_id} /> : null
    },
    DecryptedInspector: function Component(props) {
        const collectibleUrl = getRelevantUrl(extractTextFromTypedMessage(props.message).unwrapOr(''))
        const asset = getAssetInfoFromURL(collectibleUrl)
        return asset ? <Renderer chainId={asset.chain_id} projectId={asset.project_id} /> : null
    },
    ApplicationEntries: [
        {
            isInDappList: true,
            marketListSortingPriority: 15,
            description:
                'Artblocks allow you to pick a style that you like, pay for the work, and a randomly generated version of the content is created by an algorithm and sent to your Ethereum account.',
            name: 'Artblocks',
            AppIcon: <ArtBlocksIcon />,
        },
    ],
}

function Renderer(props: React.PropsWithChildren<{ chainId: ChainId; projectId: string }>) {
    usePluginWrapper(true)
    return (
        <EthereumChainBoundary chainId={props.chainId}>
            <Collectible projectId={props.projectId} />
        </EthereumChainBoundary>
    )
}

export default sns
