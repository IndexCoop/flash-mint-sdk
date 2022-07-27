import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { WETH } from '../constants/tokens'
import { FlashMintZeroEx } from '../flashMint/zeroEx'
import { ZeroExApi } from '../utils/0x'
import { getFlashMintZeroExContract } from '../utils/contracts'
import { getIssuanceModule } from '../utils/issuanceModules'
import { slippageAdjustedTokenAmount } from '../utils/slippage'
import { getAddressForToken } from '../utils/tokens'
import { QuoteToken } from './quoteToken'

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

  let componentQuotes: string[] = []
  // Input for issuing / output for redeeming
  let inputOutputTokenAmount = BigNumber.from(0)
  // 0xAPI expects percentage as value between 0-1 e.g. 5% -> 0.05
  const slippagePercentage = slippage / 100

  const inputTokenIsEth = inputToken.symbol === 'ETH'
  const outputTokenIsEth = outputToken.symbol === 'ETH'
  const inputTokenAddressOrWeth = inputTokenIsEth
    ? wethAddress
    : inputTokenAddress
  const outputTokenAddressOrWeth = outputTokenIsEth
    ? wethAddress
    : outputTokenAddress

  const quotePromises: Promise<any>[] = []
  components.forEach((component, index) => {
    const buyAmount = positions[index]
    const sellAmount = positions[index]
    const buyToken = isMinting ? component : outputTokenAddressOrWeth
    const sellToken = isMinting ? inputTokenAddressOrWeth : component

    if (buyToken === sellToken) {
      inputOutputTokenAmount = isMinting
        ? inputOutputTokenAmount.add(buyAmount)
        : inputOutputTokenAmount.add(sellAmount)
    } else {
      const params = isMinting
        ? {
            buyToken,
            sellToken,
            buyAmount: buyAmount.toString(),
            slippagePercentage,
          }
        : {
            buyToken,
            sellToken,
            sellAmount: sellAmount.toString(),
            slippagePercentage,
          }
      const quotePromise = zeroExApi.getSwapQuote(params, chainId ?? 1)
      quotePromises.push(quotePromise)
    }
  })

  const results = await Promise.all(quotePromises)
  if (results.length < 1) return null

  componentQuotes = results.map((result) => result.data)
  inputOutputTokenAmount = results
    .map((result) =>
      BigNumber.from(isMinting ? result.sellAmount : result.buyAmount)
    )
    .reduce((prevValue, currValue) => {
      return currValue.add(prevValue)
    })

  const inputOuputTokenDecimals = isMinting
    ? inputToken.decimals
    : outputToken.decimals
  inputOutputTokenAmount = slippageAdjustedTokenAmount(
    inputOutputTokenAmount,
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
  const contract = getFlashMintZeroExContract(provider, chainId)
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
