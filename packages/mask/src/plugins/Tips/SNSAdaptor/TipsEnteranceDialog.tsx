import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { DialogContent, Button } from '@mui/material'
import { useI18N } from '../../../utils'
import { makeStyles } from '@masknet/theme'
import { VerifyAlertLine } from './components/VerifyAlertLine'
import { useState } from 'react'
export interface TipsEntranceDialogProps {
    open: boolean
    onClose?: () => void
}
const useStyles = makeStyles()((theme) => ({
    walletBtn: {
        fontSize: '14px',
    },
}))

const WalletButton = () => {
    const { classes } = useStyles()
    return (
        <Button className={classes.walletBtn} variant="contained" size="small">
            Wallets
        </Button>
    )
}
export function TipsEntranceDialog({ open, onClose }: TipsEntranceDialogProps) {
    const { t } = useI18N()
    const { classes } = useStyles()
    const [showAlert, setShowAlert] = useState(true)
    return (
        <InjectedDialog
            open={open}
            onClose={() => {
                onClose()
            }}
            title={t('plugin_tips_name')}
            badgeAction={WalletButton()}>
            <DialogContent>{showAlert && <VerifyAlertLine onClose={() => setShowAlert(false)} />}</DialogContent>
        </InjectedDialog>
    )
}
