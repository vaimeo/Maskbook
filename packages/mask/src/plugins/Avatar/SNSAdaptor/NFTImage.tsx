import classNames from 'classnames'
import { makeStyles } from '@masknet/theme'
import { isSameAddress, NetworkPluginID } from '@masknet/web3-shared-base'
import { SelectedIcon } from '../assets/selected.js'
import type { AllChainsNonFungibleToken } from '../types.js'
import { Box, Tooltip, useTheme } from '@mui/material'
import { Image } from '@masknet/shared'
import { mask_avatar_dark, mask_avatar_light } from '../constants.js'
import { useWeb3State } from '@masknet/plugin-infra/web3'

const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'relative',
    },
    icon: {
        position: 'absolute',
        top: 5,
        right: 5,
        width: 20,
        height: 20,
        color: theme.palette.primary.main,
    },
    image: {
        width: 100,
        height: 100,
        objectFit: 'cover',
        boxSizing: 'border-box',
        borderRadius: 8,
        border: '1px solid transparent',
    },
    selected: {
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 8,
    },
    imageLoading: {
        color: theme.palette.maskColor.main,
        height: '20px !important',
        width: '20px !important',
    },
    imageLoadingBox: {
        background:
            theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #202020 0%, #181818 100%)'
                : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 100%), linear-gradient(90deg, rgba(98, 152, 234, 0.2) 1.03%, rgba(98, 152, 234, 0.2) 1.04%, rgba(98, 126, 234, 0.2) 100%)',
        borderRadius: 8,
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
    },
}))

interface NFTImageProps {
    pluginId: NetworkPluginID
    showBadge?: boolean
    token: AllChainsNonFungibleToken
    selectedToken?: AllChainsNonFungibleToken
    onClick: (token: AllChainsNonFungibleToken) => void
}

function isSameNFT(pluginId: NetworkPluginID, a: AllChainsNonFungibleToken, b?: AllChainsNonFungibleToken) {
    return pluginId !== NetworkPluginID.PLUGIN_SOLANA
        ? isSameAddress(a.contract?.address, b?.contract?.address) &&
              a.contract?.chainId &&
              a.contract?.chainId === b?.contract?.chainId &&
              a.tokenId === b?.tokenId
        : a.tokenId === b?.tokenId && a.id === b.id
}

export function NFTImage(props: NFTImageProps) {
    const { token, onClick, selectedToken, showBadge = false, pluginId } = props
    const { classes } = useStyles()
    const theme = useTheme()
    const { Others } = useWeb3State()

    const name = token.collection?.name || token.contract?.name
    const uiTokenId = Others?.formatTokenId(token.tokenId, 4) ?? `#${token.tokenId}`
    const title = name ? `${name} ${uiTokenId}` : token.metadata?.name ?? ''

    return (
        <Tooltip
            title={title}
            arrow
            disableInteractive
            placement="top"
            PopperProps={{ disablePortal: true, popperOptions: { strategy: 'absolute' } }}>
            <Box className={classes.root} data-src={token.metadata?.imageURL}>
                <Image
                    fallback={theme.palette.mode === 'dark' ? mask_avatar_dark : mask_avatar_light}
                    classes={{
                        imageLoading: classes.imageLoading,
                        container: classes.imageLoadingBox,
                    }}
                    onClick={() => onClick(token)}
                    src={token.metadata?.imageURL ?? ''}
                    className={classNames(
                        classes.image,
                        isSameNFT(pluginId, token, selectedToken) ? classes.selected : '',
                    )}
                />
                {showBadge && isSameNFT(pluginId, token, selectedToken) ? (
                    <SelectedIcon className={classes.icon} />
                ) : null}
            </Box>
        </Tooltip>
    )
}
