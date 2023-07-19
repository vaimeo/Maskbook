import { memo, useCallback } from 'react'
import urlcat from 'urlcat'
import { getRegisteredWeb3Providers } from '@masknet/plugin-infra'
import { ExtensionSite, NetworkPluginID, PopupModalRoutes, PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { ChainId, ProviderType } from '@masknet/web3-shared-evm'
import { Web3 } from '@masknet/web3-providers'
import { Box, Typography } from '@mui/material'
import Services from '../../../service.js'
import { useLocation, useNavigate } from 'react-router-dom'
import { useModalNavigate } from '../index.js'
import { HomeTabType } from '../../pages/Wallet/type.js'
import { useWallets } from '@masknet/web3-hooks-base'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 16,
    },
    providerItem: {
        cursor: 'pointer',
        background: theme.palette.maskColor.bg,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        padding: theme.spacing(1.5),
    },
    providerIcon: {
        width: 36,
        height: 36,
    },
    providerName: {
        fontSize: 12,
        fontWeight: 700,
        color: theme.palette.maskColor.second,
    },
}))

export const SelectProvider = memo(function SelectProvider() {
    const { classes } = useStyles()

    const wallets = useWallets()
    const navigate = useNavigate()
    const modalNavigate = useModalNavigate()
    const location = useLocation()
    const providers = getRegisteredWeb3Providers(NetworkPluginID.PLUGIN_EVM)

    const onClick = useCallback(
        async (providerType: ProviderType) => {
            const params = new URLSearchParams(location.search)
            const disableNewWindow = params.get('disableNewWindow')

            if (providerType === ProviderType.MaskWallet) {
                navigate(
                    wallets.length
                        ? urlcat(PopupRoutes.SelectWallet, { verifyWallet: true, chainId: ChainId.Mainnet })
                        : PopupRoutes.Wallet,
                )
                return
            } else if (providerType === ProviderType.WalletConnect) {
                const account = await Web3.connect({ providerType })

                // wallet connect has been connected
                if (account) {
                    navigate(PopupRoutes.ConnectWallet)
                    return
                }
            } else {
                if (disableNewWindow) {
                    modalNavigate(
                        PopupModalRoutes.ConnectProvider,
                        {
                            providerType,
                        },
                        {
                            replace: true,
                        },
                    )
                    return
                }

                await Services.Helper.openPopupWindow(
                    PopupRoutes.Personas,
                    { providerType, from: PopupModalRoutes.SelectProvider, tab: HomeTabType.ConnectedWallets },
                    true,
                )

                return
            }
        },
        [location.search, wallets],
    )

    return (
        <Box className={classes.container}>
            {providers
                .filter((x) => (x.enableRequirements?.supportedExtensionSites ?? []).includes(ExtensionSite.Popup))
                .map((provider) => {
                    return (
                        <div className={classes.providerItem} key={provider.ID} onClick={() => onClick(provider.type)}>
                            <img src={provider.icon} className={classes.providerIcon} />
                            <Typography className={classes.providerName}>{provider.name}</Typography>
                        </div>
                    )
                })}
        </Box>
    )
})
