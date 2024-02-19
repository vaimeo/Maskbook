import { memo, useCallback, useEffect, useState } from 'react'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useMediaQuery, type Theme } from '@mui/material'
import { useRedPacketTrans } from '../locales/index.js'
import { FireflyRedPacketAPI } from '@masknet/web3-providers/types'
import { useRefundCallback } from './hooks/useRefundCallback.js'
import { openComposition } from './openComposition.js'
import { RedPacketMetaKey } from '../constants.js'
import { FireflyRedPacket } from '@masknet/web3-providers'
import type { ChainId } from '@masknet/web3-shared-evm'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        actionButton: {
            fontSize: 12,
            width: 88,
            height: 32,
            background: theme.palette.maskColor.dark,
            color: theme.palette.maskColor.white,
            borderRadius: '999px',
            minHeight: 'auto',
            [smallQuery]: {
                marginTop: theme.spacing(1),
            },
            '&:disabled': {
                background: theme.palette.maskColor.dark,
                color: theme.palette.common.white,
            },
            '&:hover': {
                background: theme.palette.maskColor.dark,
                color: theme.palette.maskColor.white,
                opacity: 0.8,
            },
        },
    }
})

interface TokenInfo {
    symbol: string
    decimals: number
    amount?: string
}
interface Props {
    rpid: string
    account: string
    redpacketStatus: FireflyRedPacketAPI.RedPacketStatus
    claim_strategy?: FireflyRedPacketAPI.StrategyPayload[]
    shareFrom?: string
    themeId?: string
    tokenInfo: TokenInfo
    redpacketMsg?: string
    chainId: ChainId
    totalAmount?: string
    createdAt?: number
}

export const FireflyRedPacketActionButton = memo(function FireflyRedPacketActionButton(props: Props) {
    const {
        redpacketStatus: _redpacketStatus,
        rpid,
        account,
        claim_strategy,
        shareFrom,
        themeId,
        tokenInfo,
        redpacketMsg,
        chainId,
        totalAmount,
        createdAt,
    } = props
    const [updatedStatus, setUpdatedStatus] = useState<FireflyRedPacketAPI.RedPacketStatus>()
    const { classes, cx } = useStyles()
    const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))
    const t = useRedPacketTrans()

    const [{ loading: isRefunding }, refunded, refundCallback] = useRefundCallback(4, account, rpid, chainId)
    const statusToTransMap = {
        [FireflyRedPacketAPI.RedPacketStatus.Send]: t.send(),
        [FireflyRedPacketAPI.RedPacketStatus.Expired]: t.expired(),
        [FireflyRedPacketAPI.RedPacketStatus.Empty]: t.empty(),
        [FireflyRedPacketAPI.RedPacketStatus.Refund]: t.expired(),
        [FireflyRedPacketAPI.RedPacketStatus.View]: t.view(),
        [FireflyRedPacketAPI.RedPacketStatus.Refunding]: t.refund(),
    }

    const handleShare = useCallback(() => {
        if (!shareFrom || !themeId || !createdAt) return

        const payloadImage = FireflyRedPacket.getPayloadUrlByThemeId(
            themeId,
            shareFrom,
            tokenInfo.amount,
            'fungible',
            tokenInfo.symbol,
            Number(tokenInfo.decimals),
        )
        openComposition(
            RedPacketMetaKey,
            {
                contract_version: 4,
                sender: {
                    address: account,
                    name: shareFrom,
                    message: redpacketMsg,
                },
                creation_time: createdAt * 1000,
                token: {
                    chainId,
                    symbol: tokenInfo.symbol,
                    decimals: tokenInfo.decimals,
                },
                contract_address: rpid,
                rpid,
                shares: totalAmount,
                total: tokenInfo.amount,
            },
            undefined,
            { claimRequirements: claim_strategy, payloadImage },
        )
    }, [])

    const handleClick = useCallback(async () => {
        if (redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Send) {
            handleShare()
        }
        if (redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Refunding) {
            console.log(await refundCallback())
        }
    }, [_redpacketStatus])

    useEffect(() => {
        if (refunded) setUpdatedStatus(FireflyRedPacketAPI.RedPacketStatus.Refund)
    }, [refunded])

    const redpacketStatus = updatedStatus || _redpacketStatus

    return (
        <ActionButton
            loading={isRefunding}
            fullWidth={isSmall}
            onClick={() => {
                handleClick()
            }}
            className={cx(classes.actionButton)}
            disabled={
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Empty ||
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Expired ||
                redpacketStatus === FireflyRedPacketAPI.RedPacketStatus.Refund
            }
            size="large">
            {statusToTransMap[redpacketStatus]}
        </ActionButton>
    )
})
