import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { WETH } from '../../constants/tokens'
import { FlashMintZeroEx } from '../../flashMint/zeroEx'
import { ZeroExApi } from '../../utils/0x'
import { getFlashMintZeroExContractForToken } from '../../utils/contracts'
import { getIssuanceModule } from '../../utils/issuanceModules'
import { slippageAdjustedTokenAmount } from '../../utils/slippage'
import { getAddressForToken } from '../../utils/tokens'
import { QuoteToken } from '../quoteToken'

import { ComponentsQuoteProvider } from './componentsQuoteProvider'

export interface FlashMintZeroExQuote {
  componentQuotes: string[]
  inputOutputTokenAmount: BigNumber
  setTokenAmount: BigNumber
}

/**
 * Returns a Flash Mint ZeroEx quote (incl. 0x trade data) or null.
 *
 * @param inputToken          The input token (token you sell)
 * @param outputToken         The output token (token you receive)
 * @param setTokenAmount      The amount of set token that should be received/sold
 * @param isMinting           Whether minting or redeeming
 * @param slippage            The slippage to use
 * @param zeroExApi           A ZeroExApi instance
 * @param provider            A JsonRpcProvider instance
 * @param chainId             ID for current chain
 *
 * @return An FlashMintZeroExQuote.
 */
export const getFlashMintZeroExQuote = async (
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  setTokenAmount: BigNumber,
  isMinting: boolean,
  slippage: number,
  zeroExApi: ZeroExApi,
  provider: JsonRpcProvider,
  chainId: number
): Promise<FlashMintZeroExQuote | null> => {
  const inputTokenAddress = inputToken.address
  const outputTokenAddress = outputToken.address
  const wethAddress = getAddressForToken(WETH, chainId)

  if (wethAddress === undefined) {
    console.error('Error - WETH address not defined')
    return null
  }

  const setTokenAddress = isMinting ? outputTokenAddress : inputTokenAddress
  const setTokenSymbol = isMinting ? outputToken.symbol : inputToken.symbol

  const { components, positions } = await getRequiredComponents(
    isMinting,
    setTokenAddress,
    setTokenSymbol,
    setTokenAmount,
    provider,
    chainId
  )

  const quoteProvider = new ComponentsQuoteProvider(
    chainId,
    slippage,
    wethAddress,
    zeroExApi
  )
  const quoteResult = await quoteProvider.getComponentQuotes(
    components,
    positions,
    isMinting,
    inputToken,
    outputToken
  )
  if (!quoteResult) return null
  const { componentQuotes, inputOutputTokenAmount: ioTokenAmount } = quoteResult

  const inputOuputTokenDecimals = isMinting
    ? inputToken.decimals
    : outputToken.decimals
  const inputOutputTokenAmount = slippageAdjustedTokenAmount(
    ioTokenAmount,
    inputOuputTokenDecimals,
    slippage,
    isMinting
  )

  return {
    componentQuotes,
    inputOutputTokenAmount,
    setTokenAmount,
  }
}

/**
 * Returns the required component and position quotes depending on minting/redeeming.
 * @param isMinting       Whether minting or redeeming
 * @param setToken        Address of the Set token
 * @param setTokenSymbol  Symbol of the Set token
 * @param setTokenAmount  Amount of the Set token
 * @param provider        An instance of JsonRpcProvider
 * @param chainId         ID of the network
 */
export async function getRequiredComponents(
  isMinting: boolean,
  setToken: string,
  setTokenSymbol: string,
  setTokenAmount: BigNumber,
  provider: JsonRpcProvider,
  chainId: number
) {
  const contract = getFlashMintZeroExContractForToken(
    setTokenSymbol,
    provider,
    chainId
  )
  const flashMint = new FlashMintZeroEx(contract)
  const issuanceModule = getIssuanceModule(setTokenSymbol, chainId)

  const { components, positions } = isMinting
    ? await flashMint.getRequiredIssuanceComponents(
        issuanceModule.address,
        issuanceModule.isDebtIssuance,
        setToken,
        setTokenAmount
      )
    : await flashMint.getRequiredRedemptionComponents(
        issuanceModule.address,
        issuanceModule.isDebtIssuance,
        setToken,
        setTokenAmount
      )

  return { components, positions }
}
