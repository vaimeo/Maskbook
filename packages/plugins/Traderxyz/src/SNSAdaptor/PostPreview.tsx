import { Box, Chip, Grid, Typography, useTheme } from '@mui/material'
import { makeStyles, useCustomSnackbar } from '@masknet/theme'
import { useI18N } from '../locales/i18n_generated'
import { usePluginWrapper } from '@masknet/plugin-infra/content-script'
import { useAccount, useChainId } from '@masknet/web3-shared-evm'
import { useTraderApi } from '../apis/nftSwap'
import type { TradeMetaData, NFTData } from '../types'
import type { SwappableAsset } from '@traderxyz/nft-swap-sdk'
import { ActionButtonPromise } from '../../../../mask/src/extension/options-page/DashboardComponents/ActionButton'
import { useCallback, useMemo } from 'react'

const useStyles = makeStyles()((theme, props) => ({
    actions: {
        alignSelf: 'center',
    },
    mainWrapper: {
        height: 400,
        borderRadius: 10,
        border: 1,
        borderColor: ' blue !important',
    },

    bodyContent: {
        height: 400,
        background: '#cddc39',
        color: '#000000',
        borderRadius: 10,
    },

    button: {
        borderRadius: 99,
        marginTop: 0,
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 19.6,
        height: 40,
        paddingTop: 8,
        paddingLeft: 16,
        paddingBottom: 8,
        paddingRight: 16,
        backgroundColor: theme.palette.mode === 'dark' ? '#EFF3F4' : '#111418',
        color: theme.palette.mode === 'dark' ? '#0F1419' : '#FFFFFF',
    },
    buttonWrapper: {
        marginTop: 10,
        marginBottom: 10,
    },
    img: {
        borderRadius: 10,
    },
    previewBoxOuter: {
        boxShadow: 'rgb(0 0 0 / 4%) 0px 6px 40px, rgb(0 0 0 / 2%) 0px 3px 6px',
        background: theme.palette.mode === 'dark' ? '#1D2933' : 'rgb(255, 255, 255)',
        width: '100%',
        border: '0px solid blue',
        borderRadius: 16,
        height: '310px',
    },

    previewBoxInner: {
        background: theme.palette.mode === 'dark' ? '#000000' : 'rgb(245, 245, 247)',
        width: '100%',
        border: '0px solid blue',
        borderRadius: 10,
        height: '190px',
    },

    previewBoxInnerGridContainer: {
        display: 'flex',
        borderCollapse: 'collapse',
        width: '100%',
        border: '0px solid green',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        borderRadius: 15,
    },

    previewBoxInnerGridContainerItem: {
        display: 'table-cell',
        height: '190px',
        border: '0px solid green',
    },
    previewBoxInnerGridContainerItemImg: {
        height: '100%',
        maxWidth: '100%',
        objectFit: 'cover',
        borderRadius: '10px',
        userSelect: 'none',
    },
    previewBoxInnerGridContainerChip: {
        position: 'relative',
        left: '65%',
        top: '-35px',
        background: theme.palette.mode === 'dark' ? '#1D2933' : 'rgb(23, 23, 23)',
        color: 'white',
        fontSize: '18px',
        border: '1px solid rgb(0, 0, 0)',
        padding: '10px 5px 10px',
    },
    previewBoxInnerGridFooterTitle1: {
        fontWeight: 500,
        fontSize: '18px',
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    },
    previewBoxInnerGridFooterTitle2: {
        fontWeight: 'normal',
        fontSize: '14px',
        color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
    },
}))

/**
 * This page we use to full fill order
 */

export function PostPreview({ info }: { info: TradeMetaData }) {
    const selectedChainId = useChainId()
    const nftSwapSdk = useTraderApi(selectedChainId)
    const account = useAccount()
    const { classes } = useStyles()
    const t = useI18N()
    const theme = useTheme()
    const { showSnackbar } = useCustomSnackbar()

    const signOrder = useCallback(async () => {
        const normalizeSignedOrder = nftSwapSdk.normalizeSignedOrder(info.signedOrder)
        const walletAddressUserA = account
        const assetsToSwapUserA = [info.assetsInfo.receiving_token, ...info.assetsInfo.nfts]

        /// Check order status

        // Invalid = 0,
        // InvalidMakerAssetAmount = 1,
        // InvalidTakerAssetAmount = 2,
        // Fillable = 3,
        // Expired = 4,
        // FullyFilled = 5,
        // Cancelled = 6

        const orderStatus = await nftSwapSdk.getOrderStatus(normalizeSignedOrder)

        if (orderStatus === 3) {
            // Fillable
            // Check if we need to approve the NFT for swapping
            const approvalStatusForUserA = await nftSwapSdk.loadApprovalStatus(
                assetsToSwapUserA[0] as SwappableAsset,
                walletAddressUserA,
            )

            // Check if buyer needs to approve the sell token contract or no
            if (!approvalStatusForUserA.contractApproved) {
                // If not approved
                const approvalTx = await nftSwapSdk.approveTokenOrNftByAsset(
                    assetsToSwapUserA[0] as SwappableAsset,
                    walletAddressUserA,
                )

                await approvalTx.wait().then(
                    (msg) => {
                        const message = `Approved ${assetsToSwapUserA[0]?.tokenAddress} contract to swap with 0x (txHash: ${msg.transactionHash})`
                        showSnackbar(message, { variant: 'success' })
                    },
                    (error) => showSnackbar(t.submit_order_submit_error_message() + error, { variant: 'error' }),
                )
            }
            // fill order
            const fillTx = await nftSwapSdk.fillSignedOrder(normalizeSignedOrder).then(
                async (fillTx) => {
                    const fillTxReceipt = await nftSwapSdk.awaitTransactionHash(fillTx?.hash).then(
                        (fillTxReceipt) => {
                            if (fillTxReceipt.status !== 0) {
                                const message = `\u{1F389} \u{1F973} ${t.submit_order_filled_message()} ${
                                    fillTxReceipt?.transactionHash
                                }`
                                showSnackbar(message, { variant: 'success' })
                            } else {
                                showSnackbar(
                                    t.submit_order_submit_error_message() + fillTxReceipt?.transactionHash + ' failed',
                                    { variant: 'error' },
                                )
                            }
                        },
                        (error) =>
                            showSnackbar(t.submit_order_submit_error_message() + ' fillTxReceipt error :' + error, {
                                variant: 'error',
                            }),
                    )
                },
                (error) => showSnackbar(t.submit_order_submit_error_message() + error, { variant: 'error' }),
            )
        }

        if (orderStatus === 5) {
            // FullyFilled
            showSnackbar(t.order_filled(), { variant: 'error' })
        }

        if (orderStatus === 4) {
            // Expired
            showSnackbar(t.order_expired(), { variant: 'error' })
        }

        if (orderStatus === 6) {
            // Cancelled
            showSnackbar(t.order_cancelled(), { variant: 'error' })
        }

        if (orderStatus === 6) {
            // Cancelled
            showSnackbar(t.order_cancelled(), { variant: 'error' })
        }

        if (orderStatus === 0) {
            // Cancelled
            showSnackbar(t.order_invalid(), { variant: 'error' })
        }

        if (orderStatus === 1) {
            // Invalid
            showSnackbar(t.order_invalid_maker(), { variant: 'error' })
        }

        if (orderStatus === 2) {
            // Invalid
            showSnackbar(t.order_invalid_taker(), { variant: 'error' })
        }
    }, [])

    const nftList = info.assetsInfo.preview_info.nftMediaUrls
    const previewImages = nftList.map((item: NFTData, index: number) => {
        return (
            <Grid key={index} className={classes.previewBoxInnerGridContainerItem} padding={1}>
                <img
                    className={classes.previewBoxInnerGridContainerItemImg}
                    alt={item.nft_name}
                    src={item.image_preview_url}
                />
            </Grid>
        )
    })

    const chipTitle =
        info.assetsInfo.preview_info.receivingSymbol.amount + ' ' + info.assetsInfo.preview_info.receivingSymbol.symbol

    const labelString = useMemo(() => {
        let labelString = ''
        const n = nftList

        if (n && n.length > 0) {
            labelString = `${t.preview_order_label_title1()} ${n[0]?.nft_name} (#${n[0]?.nft_id})`

            if (n.length > 1) {
                labelString += ` ${t.preview_order_label_title2()} ${n[1]?.nft_name} (#${n[1]?.nft_id})`
            }

            if (n.length > 2) {
                labelString += ` ${t.preview_order_label_title3()}`
            }

            labelString += ` ${t.preview_order_label_title4()} ` + chipTitle
        }

        return labelString
    }, [nftList])

    usePluginWrapper(true)
    return (
        <Box className={classes.previewBoxOuter} padding={1}>
            <Box className={classes.previewBoxInner}>
                <Grid className={classes.previewBoxInnerGridContainer} padding={0}>
                    {previewImages}
                </Grid>
                <Chip className={classes.previewBoxInnerGridContainerChip} label={chipTitle} />
            </Box>
            <Grid container direction="column" justifyContent="center" alignItems="flex-start">
                <Grid item>
                    <Typography paddingTop={1} variant="subtitle1" className={classes.previewBoxInnerGridFooterTitle1}>
                        {labelString}
                    </Typography>
                </Grid>
            </Grid>
            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} className={classes.buttonWrapper}>
                <Grid item xs={12}>
                    <ActionButtonPromise
                        className={classes.button}
                        variant="contained"
                        init={t.post_preview_swap_btn()}
                        waiting={t.post_preview_swap_btn()}
                        complete={t.post_preview_swap_btn()}
                        failed={t.post_preview_swap_btn()}
                        fullWidth
                        executor={signOrder}
                        completeIcon={null}
                        failIcon={null}
                        data-testid="submit_btn"
                    />
                </Grid>
            </Grid>
        </Box>
    )
}
