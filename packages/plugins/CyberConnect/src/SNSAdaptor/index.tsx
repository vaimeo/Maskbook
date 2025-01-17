import { type Plugin, usePostInfoDetails, usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { base } from '../base'
import { CyberConnectIcon } from '@masknet/icons'
import { useMemo } from 'react'
import { parseURL } from '@masknet/shared-base'
import { extractTextFromTypedMessage } from '@masknet/typed-message'
import Profile from './Profile'

const isCyberConnectUrl = (x: string): boolean => x.includes('app.cyberconnect.me')

function Renderer({ url }: { url: string }) {
    usePluginWrapper(true)
    return <Profile url={url} />
}

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    DecryptedInspector: function Component(props): JSX.Element | null {
        const link = useMemo(() => {
            const x = extractTextFromTypedMessage(props.message)
            if (x.none) return null
            return parseURL(x.val).find(isCyberConnectUrl)
        }, [props.message])
        if (!link) return null
        return <Renderer url={link} />
    },
    PostInspector: function Component(): JSX.Element | null {
        const link = usePostInfoDetails.mentionedLinks().find(isCyberConnectUrl)
        if (!link) return null
        return <Renderer url={link} />
    },
    ApplicationEntries: [
        {
            ApplicationEntryID: base.ID,
            category: 'dapp',
            marketListSortingPriority: 17,
            description: {
                i18nKey: '__plugin_description',
                fallback: 'Decentralized social graph protocol for user-centric Web3.',
            },
            name: { i18nKey: '__plugin_name', fallback: 'CyberConnect' },
            icon: <CyberConnectIcon />,
            tutorialLink: 'https://cyberconnect.me/',
        },
    ],
}

export default sns
