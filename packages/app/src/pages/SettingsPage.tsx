import { memo, useCallback } from 'react'
import { DashboardContainer } from '../components/DashboardContainer.js'
import { DashboardHeader } from '../components/DashboardHeader.js'

import { Button, MenuItem, Typography } from '@mui/material'
import { useMenuConfig } from '@masknet/shared'
import { useSystemPreferencePalette } from '@masknet/theme'
import { setThemeMode } from '../helpers/setThemeMode.js'
import { Appearance } from '@masknet/public-api'

export interface SettingsPageProps {}

export default function SettingsPage(props: SettingsPageProps) {
    return (
        <DashboardContainer>
            <main>
                <DashboardHeader title="Settings" />
                <div className="bg-white p-5">
                    <div className="border overflow-hidden rounded-lg">
                        <SetupThemeMode />
                    </div>
                </div>
            </main>
        </DashboardContainer>
    )
}

const SetupThemeMode = memo(() => {
    const systemMode = useSystemPreferencePalette()

    const onClick = useCallback(
        (mode: Appearance) => {
            localStorage.themeMode = mode
            setThemeMode(mode, systemMode)
        },
        [localStorage.themeMode, systemMode],
    )

    const [menu, openMenu] = useMenuConfig(
        [
            <MenuItem key={Appearance.default} onClick={() => onClick(Appearance.default)}>
                <Typography component="span">System</Typography>
            </MenuItem>,
            <MenuItem key={Appearance.dark} onClick={() => onClick(Appearance.dark)}>
                <Typography component="span">Dark</Typography>
            </MenuItem>,
            <MenuItem key={Appearance.light} onClick={() => onClick(Appearance.light)}>
                <Typography component="span">Light</Typography>
            </MenuItem>,
        ],
        {
            anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'center',
            },
        },
    )

    return (
        <div className="flex w-full sm:p-6 justify-center sm:items-center">
            <Typography className="w-full text-black text-base">theme</Typography>
            <Button className="text-black bg-black/10  hover:bg-black/10 hover:text-black" onClick={openMenu}>
                {localStorage.themeMode === Appearance.dark
                    ? 'Dark'
                    : localStorage.themeMode === Appearance.light
                    ? 'Light'
                    : 'System'}
            </Button>
            {menu}
        </div>
    )
})
