import { useCallback, useEffect, useState } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import {
    ChainId,
    createERC20Token,
    createNativeToken,
    formatBalance,
    isSameAddress,
    TransactionStateType,
    useChainId,
    useChainIdValid,
    useFungibleTokenBalance,
    useTokenConstants,
    useWallet,
    UST,
} from '@masknet/web3-shared-evm'
import { Web3TokenType, FungibleTokenDetailed } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { delay } from '@dimensiondev/kit'
import { useGasConfig } from './hooks/useGasConfig'
import type { Coin } from '../../types'
import { TokenPanelType, TradeInfo } from '../../types'
import { useI18N } from '../../../../utils'
import { TradeForm } from './TradeForm'
import { AllProviderTradeActionType, AllProviderTradeContext } from '../../trader/useAllProviderTradeContext'
import { SelectTokenDialogEvent, WalletMessages } from '@masknet/plugin-wallet'
import { useUnmount, useUpdateEffect } from 'react-use'
import { isTwitter } from '../../../../social-network-adaptor/twitter.com/base'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { isFacebook } from '../../../../social-network-adaptor/facebook.com/base'
import { useTradeCallback } from '../../trader/useTradeCallback'
import { isNativeTokenWrapper } from '../../helpers'
import { ConfirmDialog } from './ConfirmDialog'
import { TargetChainIdContext } from '../../trader/useTargetChainIdContext'
import { PluginTraderMessages } from '../../messages'
import { SettingsDialog } from './SettingsDialog'
import { useSortedTrades } from './hooks/useSortedTrades'
import { useUpdateBalance } from './hooks/useUpdateBalance'

const useStyles = makeStyles()(() => {
    return {
        root: {
            margin: 'auto',
        },
    }
})

export interface TraderProps extends withClasses<'root'> {
    coin?: Coin
    defaultInputCoin?: Coin
    defaultOutputCoin?: Coin
    tokenDetailed?: FungibleTokenDetailed
    chainId?: ChainId
}

export function Trader(props: TraderProps) {
    const { defaultOutputCoin, coin, chainId: targetChainId, defaultInputCoin } = props
    const [focusedTrade, setFocusTrade] = useState<TradeInfo>()
    const wallet = useWallet()
    const currentChainId = useChainId()
    const chainId = targetChainId ?? currentChainId
    const chainIdValid = useChainIdValid()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    const classes = useStylesExtends(useStyles(), props)
    const { t } = useI18N()
    const { setTargetChainId } = TargetChainIdContext.useContainer()

    // #region trade state
    const {
        tradeState: [
            { inputToken, outputToken, inputTokenBalance, outputTokenBalance, inputAmount },
            dispatchTradeStore,
        ],
        allTradeComputed,
        setTemporarySlippage,
    } = AllProviderTradeContext.useContainer()
    // #endregion

    // #region gas config and gas price
    const { gasPrice, gasConfig, setGasConfig } = useGasConfig(chainId)
    // #endregion

    // #region if chain id be changed, update input token be native token
    useEffect(() => {
        if (!chainIdValid) return

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: chainId === ChainId.Mainnet && coin?.is_mirrored ? UST[ChainId.Mainnet] : createNativeToken(chainId),
        })
    }, [chainId, chainIdValid])
    // #endregion

    const updateTradingCoin = useCallback(
        (
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN | AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            coin?: Coin,
        ) => {
            if (!coin?.contract_address) return
            dispatchTradeStore({
                type,
                token: createERC20Token(chainId, coin.contract_address, coin.decimals, coin.name, coin.symbol),
            })
        },
        [chainId],
    )
    useEffect(() => {
        updateTradingCoin(AllProviderTradeActionType.UPDATE_INPUT_TOKEN, defaultInputCoin)
    }, [updateTradingCoin, defaultInputCoin])
    useEffect(() => {
        updateTradingCoin(AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN, defaultOutputCoin)
    }, [updateTradingCoin, defaultOutputCoin])

    // #region if coin be changed, update output token
    useEffect(() => {
        if (!coin || currentChainId !== targetChainId) return

        // if coin be native token and input token also be native token, reset it
        if (
            isSameAddress(coin.contract_address, NATIVE_TOKEN_ADDRESS) &&
            inputToken?.type === Web3TokenType.Native &&
            coin.symbol === inputToken.symbol
        ) {
            dispatchTradeStore({
                type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
                token: undefined,
            })
        }
        if (!outputToken) {
            updateTradingCoin(AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN, coin)
        }
    }, [coin, NATIVE_TOKEN_ADDRESS, inputToken, outputToken, currentChainId, targetChainId, updateTradingCoin])

    useEffect(() => {
        if (!defaultInputCoin) return
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: defaultInputCoin.contract_address
                ? createERC20Token(
                      chainId,
                      defaultInputCoin.contract_address,
                      defaultInputCoin.decimals,
                      defaultInputCoin.name,
                      defaultInputCoin.symbol,
                  )
                : undefined,
        })
    }, [defaultInputCoin, chainId])

    const onInputAmountChange = useCallback((amount: string) => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount,
        })
    }, [])

    // #region update balance
    const { value: inputTokenBalance_, loading: loadingInputTokenBalance } = useFungibleTokenBalance(
        isSameAddress(inputToken?.address, NATIVE_TOKEN_ADDRESS)
            ? Web3TokenType.Native
            : inputToken?.type ?? Web3TokenType.Native,
        inputToken?.address ?? '',
        chainId,
    )

    const { value: outputTokenBalance_, loading: loadingOutputTokenBalance } = useFungibleTokenBalance(
        isSameAddress(outputToken?.address, NATIVE_TOKEN_ADDRESS)
            ? Web3TokenType.Native
            : outputToken?.type ?? Web3TokenType.Native,
        outputToken?.address ?? '',
        chainId,
    )

    useEffect(() => {
        if (
            !inputToken ||
            inputToken.type === Web3TokenType.Native ||
            !inputTokenBalance_ ||
            loadingInputTokenBalance
        ) {
            return
        }
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN_BALANCE,
            balance: inputTokenBalance_,
        })
    }, [inputToken, inputTokenBalance_, loadingInputTokenBalance])

    useEffect(() => {
        if (
            !outputToken ||
            outputToken.type === Web3TokenType.Native ||
            !outputTokenBalance_ ||
            loadingOutputTokenBalance
        ) {
            return
        }
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN_BALANCE,
            balance: outputTokenBalance_,
        })
    }, [outputToken, outputTokenBalance_, loadingOutputTokenBalance])

    // #region select token
    const excludeTokens = [inputToken, outputToken].filter(Boolean).map((x) => x?.address) as string[]
    const [focusedTokenPanelType, setFocusedTokenPanelType] = useState(TokenPanelType.Input)

    const { setDialog: setSelectTokenDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectTokenDialogUpdated,
        useCallback(
            (ev: SelectTokenDialogEvent) => {
                if (ev.open || !ev.token || ev.uuid !== String(focusedTokenPanelType)) return
                dispatchTradeStore({
                    type:
                        focusedTokenPanelType === TokenPanelType.Input
                            ? AllProviderTradeActionType.UPDATE_INPUT_TOKEN
                            : AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
                    token: ev.token,
                })
                if (focusedTokenPanelType === TokenPanelType.Input) {
                    dispatchTradeStore({
                        type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
                        amount: '',
                    })
                }
            },
            [dispatchTradeStore, focusedTokenPanelType],
        ),
    )

    const onTokenChipClick = useCallback(
        (type: TokenPanelType) => {
            setFocusedTokenPanelType(type)
            setSelectTokenDialog({
                chainId,
                open: true,
                uuid: String(type),
                disableNativeToken: false,
                FungibleTokenListProps: {
                    selectedTokens: excludeTokens,
                },
            })
        },
        [excludeTokens.join(), chainId],
    )
    // #endregion

    // #region blocking (swap)
    const [tradeState, tradeCallback, resetTradeCallback] = useTradeCallback(
        focusedTrade?.provider,
        focusedTrade?.value,
        gasConfig,
    )
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

    const onConfirmDialogConfirm = useCallback(async () => {
        setOpenConfirmDialog(false)
        await delay(100)
        await tradeCallback()
        setTemporarySlippage(undefined)
    }, [tradeCallback])

    const onConfirmDialogClose = useCallback(() => {
        setOpenConfirmDialog(false)
        setTemporarySlippage(undefined)
    }, [])
    // #endregion

    // #region the click handler of switch arrow
    const onSwitchToken = useCallback(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_TOKEN,
            token: outputToken,
        })

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: inputToken,
        })

        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
            amount: '',
        })
    }, [dispatchTradeStore, inputToken, outputToken, inputAmount])

    // #region remote controlled transaction dialog
    const cashTag = isTwitter(activatedSocialNetworkUI) ? '$' : ''
    const shareText =
        focusedTrade?.value && inputToken && outputToken
            ? [
                  `I just swapped ${formatBalance(focusedTrade.value.inputAmount, inputToken.decimals, 6)} ${cashTag}${
                      inputToken.symbol
                  } for ${formatBalance(focusedTrade.value.outputAmount, outputToken.decimals, 6)} ${cashTag}${
                      outputToken.symbol
                  }.${
                      isTwitter(activatedSocialNetworkUI) || isFacebook(activatedSocialNetworkUI)
                          ? `Follow @${
                                isTwitter(activatedSocialNetworkUI) ? t('twitter_account') : t('facebook_account')
                            } (mask.io) to swap cryptocurrencies on ${
                                isTwitter(activatedSocialNetworkUI) ? 'Twitter' : 'Facebook'
                            }.`
                          : ''
                  }`,
                  '#mask_io',
              ].join('\n')
            : ''

    // #endregion

    // #region close the transaction dialog
    const { setDialog: setTransactionDialog } = useRemoteControlledDialog(
        WalletMessages.events.transactionDialogUpdated,
        (ev) => {
            if (ev.open) return
            if (tradeState?.type === TransactionStateType.HASH) {
                dispatchTradeStore({
                    type: AllProviderTradeActionType.UPDATE_INPUT_AMOUNT,
                    amount: '',
                })
            }
            resetTradeCallback()
        },
    )
    // #endregion

    // #region open the transaction dialog
    useEffect(() => {
        if (tradeState?.type === TransactionStateType.UNKNOWN) return
        setTransactionDialog({
            open: true,
            shareText,
            state: tradeState,
        })
    }, [tradeState /* update tx dialog only if state changed */])
    // #endregion

    // #region swap callback
    const onSwap = useCallback(() => {
        // no need to open the confirmation dialog if it (un)wraps the native token
        if (focusedTrade?.value && isNativeTokenWrapper(focusedTrade.value)) tradeCallback()
        else setOpenConfirmDialog(true)
    }, [focusedTrade, tradeCallback])
    // #endregion

    // #region The trades sort by best price (Estimate received * price - Gas fee * native token price)
    const sortedAllTradeComputed = useSortedTrades(allTradeComputed, chainId, gasPrice)
    // #endregion

    // Query the balance of native tokens on target chain
    useUpdateBalance(chainId)
    // #endregion

    // #region reset focused trade when chainId, inputToken, outputToken, inputAmount be changed
    useUpdateEffect(() => {
        setFocusTrade(undefined)
    }, [targetChainId, inputToken, outputToken, inputAmount])
    // #endregion

    // #region if chain id be changed, reset the chain id on context, and reset gas config
    useEffect(() => {
        if (!chainId) return
        setTargetChainId(chainId)
        setGasConfig(undefined)
    }, [chainId])
    // #endregion

    // #region if target chain id be changed, reset output token
    useUpdateEffect(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: undefined,
        })
    }, [targetChainId])
    // #endregion

    useEffect(() => {
        return PluginTraderMessages.swapSettingsUpdated.on((event) => {
            if (event.open) return
            if (event.gasConfig) setGasConfig(event.gasConfig)
        })
    }, [])

    useUnmount(() => {
        dispatchTradeStore({
            type: AllProviderTradeActionType.UPDATE_OUTPUT_TOKEN,
            token: undefined,
        })
    })

    // #region if trade has been changed, update the focused trade
    useUpdateEffect(() => {
        setFocusTrade((prev) => {
            const target = allTradeComputed.find((x) => prev?.provider === x.provider)
            return target ?? prev
        })
    }, [allTradeComputed])
    // #endregion

    return (
        <div className={classes.root}>
            <TradeForm
                wallet={wallet}
                trades={sortedAllTradeComputed}
                inputToken={inputToken}
                outputToken={outputToken}
                inputTokenBalance={inputTokenBalance}
                outputTokenBalance={outputTokenBalance}
                inputAmount={inputAmount}
                onInputAmountChange={onInputAmountChange}
                onTokenChipClick={onTokenChipClick}
                focusedTrade={focusedTrade}
                onFocusedTradeChange={(trade) => setFocusTrade(trade)}
                onSwap={onSwap}
                gasPrice={gasPrice}
                onSwitch={onSwitchToken}
            />
            {focusedTrade?.value && !isNativeTokenWrapper(focusedTrade.value) && inputToken && outputToken ? (
                <ConfirmDialog
                    wallet={wallet}
                    open={openConfirmDialog}
                    trade={focusedTrade.value}
                    gas={focusedTrade.gas.value}
                    gasPrice={gasPrice}
                    inputToken={inputToken}
                    outputToken={outputToken}
                    onConfirm={onConfirmDialogConfirm}
                    onClose={onConfirmDialogClose}
                />
            ) : null}
            <SettingsDialog />
        </div>
    )
}
