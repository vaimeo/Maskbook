import React from 'react'
import { makeStyles, createStyles } from '@material-ui/core/styles'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { Persona } from '../../../database'
import { Divider } from '@material-ui/core'
import { geti18nString } from '../../../utils/i18n'
import WalletLine from './WalletLine'
import ActionButton from './ActionButton'
import {
    WalletAddTokenDialog,
    WalletSendRedPacketDialog,
    WalletRedPacketHistoryDialog,
    WalletRedPacketDetailDialog,
} from '../DashboardDialogs/Wallet'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { useColorProvider } from '../../../utils/theme'

interface Props {
    persona: Persona
}

const useStyles = makeStyles(theme =>
    createStyles({
        card: {
            width: '100%',
        },
        focus: {
            margin: '-5px',
        },
        header: {
            display: 'flex',
            alignItems: 'flex-end',
            '& > .title': {
                marginRight: theme.spacing(1),
                flexGrow: 1,
                overflow: 'hidden',
            },
            '& > .extra-item': {
                visibility: 'hidden',
                cursor: 'pointer',
                fontSize: '0.8rem',
            },
            '&:hover': {
                '& > .extra-item': {
                    visibility: 'visible',
                },
            },
        },
        actions: {
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(1),
            '&:last-child': {
                paddingBottom: 0,
            },
        },
        cursor: {
            cursor: 'pointer',
        },
    }),
)

export default function WalletCard({ persona }: Props) {
    const classes = useStyles()
    const color = useColorProvider()

    const [editing, setEditing] = React.useState(false)
    const [showAddToken, setShowAddToken] = React.useState(false)
    const [showSendPacket, setShowSendPacket] = React.useState(false)
    const [showRedPacketHistory, setShowRedPacketHistory] = React.useState(false)
    const [showRedPacketDetail, setShowRedPacketDetail] = React.useState(false)

    return (
        <>
            <CardContent>
                <Typography className={classes.header} variant="h5" component="h2">
                    <>
                        <span className="title">{persona.nickname}</span>
                        <Typography
                            className="fullWidth"
                            variant="body1"
                            component="span"
                            color="textSecondary"></Typography>
                    </>
                </Typography>
                <WalletLine
                    line1="Wallet Address"
                    line2="0x5201283972828738912738912738123"
                    action={
                        <Typography color="primary" variant="body1">
                            Copy
                        </Typography>
                    }
                />
                <div className={classes.actions}>
                    <Typography
                        className={classes.cursor}
                        color="primary"
                        variant="body1"
                        onClick={() => setShowRedPacketHistory(true)}>
                        Red Packets History...
                    </Typography>
                    <ActionButton variant="contained" color="primary" onClick={() => setShowSendPacket(true)}>
                        Send Red Packet
                    </ActionButton>
                </div>
                <WalletLine
                    invert
                    line1="ETH"
                    line2="Ethereym"
                    action={<Typography variant="h5">0.20001</Typography>}
                />
                <WalletLine
                    invert
                    line1="USDT"
                    line2="Tether USD"
                    action={
                        editing ? (
                            <Typography className={color.error}>Delete</Typography>
                        ) : (
                            <Typography variant="h5">25.1</Typography>
                        )
                    }
                />
                <div className={classes.actions}>
                    <Typography
                        className={classes.cursor}
                        color="primary"
                        variant="body1"
                        onClick={() => setEditing(!editing)}>
                        {editing ? 'Done' : 'Edit List'}
                    </Typography>
                    <Typography
                        className={classes.cursor}
                        color="primary"
                        variant="body1"
                        onClick={() => setShowAddToken(true)}>
                        Add Token
                    </Typography>
                </div>
            </CardContent>
            <Divider />
            {showAddToken && (
                <DialogRouter
                    onExit={() => setShowAddToken(false)}
                    children={<WalletAddTokenDialog onConfirm={console.log} onDecline={() => setShowAddToken(false)} />}
                />
            )}
            {showSendPacket && (
                <DialogRouter
                    onExit={() => setShowSendPacket(false)}
                    children={<WalletSendRedPacketDialog onDecline={() => setShowSendPacket(false)} />}
                />
            )}
            {showRedPacketHistory && (
                <DialogRouter
                    onExit={() => setShowRedPacketHistory(false)}
                    children={
                        <WalletRedPacketHistoryDialog
                            onClick={() => setShowRedPacketDetail(true)}
                            onDecline={() => setShowRedPacketHistory(false)}
                        />
                    }
                />
            )}
            {showRedPacketDetail && (
                <DialogRouter
                    onExit={() => setShowRedPacketDetail(false)}
                    children={<WalletRedPacketDetailDialog onDecline={() => setShowRedPacketDetail(false)} />}
                />
            )}
        </>
    )
}
