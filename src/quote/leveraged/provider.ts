import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ChainId } from 'constants/chains'
import {
  collateralDebtSwapData,
  debtCollateralSwapData,
  inputSwapData,
  outputSwapData,
} from 'constants/swapdata'
import {
  ETH,
  InterestCompoundingETHIndex,
  MATIC,
  stETH,
} from 'constants/tokens'
import { getFlashMintLeveragedContractForToken } from 'utils/contracts'
import { slippageAdjustedTokenAmount } from 'utils/slippage'
import {
  Exchange,
  getSwapDataCollateralDebt,
  getSwapDataDebtCollateral,
  SwapData,
} from 'utils/swapData'
import { QuoteProvider } from '../quoteProvider'
import { QuoteToken } from '../quoteToken'
import { ZeroExApi } from 'utils/0x'
import { SwapQuoteProvider, SwapQuoteRequest } from 'quote/swap'

export interface FlashMintLeveragedQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  slippage: number
}

export interface FlashMintLeveragedQuote {
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
  swapDataDebtCollateral: SwapData
  swapDataPaymentToken: SwapData
}

export interface LeveragedTokenData {
  collateralAToken: string
  collateralToken: string
  debtToken: string
  collateralAmount: BigNumber
  debtAmount: BigNumber
}

export class LeveragedQuoteProvider
  implements
    QuoteProvider<FlashMintLeveragedQuoteRequest, FlashMintLeveragedQuote>
{
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly swapQuoteProvider: SwapQuoteProvider,
    private readonly zeroExApi: ZeroExApi
  ) {}

  async getQuote(
    request: FlashMintLeveragedQuoteRequest
  ): Promise<FlashMintLeveragedQuote | null> {
    const { provider, zeroExApi } = this
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const isIcEth = indexTokenSymbol === InterestCompoundingETHIndex.symbol
    const includedSources = getIncludedSources(isIcEth)
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const leveragedTokenData = await getLevTokenData(
      indexToken.address,
      indexTokenAmount,
      indexTokenSymbol,
      isMinting,
      chainId,
      provider
    )
    if (leveragedTokenData === null) return null
    const debtCollateralResult = isMinting
      ? await getSwapDataDebtCollateral(
          leveragedTokenData,
          includedSources,
          slippage,
          chainId,
          zeroExApi
        )
      : await getSwapDataCollateralDebt(
          leveragedTokenData,
          includedSources,
          slippage,
          chainId,
          zeroExApi
        )
    if (!debtCollateralResult) return null
    const { collateralObtainedOrSold } = debtCollateralResult
    let { swapDataDebtCollateral } = debtCollateralResult
    if (isIcEth) {
      // Just using the static versions for icETH
      swapDataDebtCollateral = isMinting
        ? debtCollateralSwapData[indexTokenSymbol]
        : collateralDebtSwapData[indexTokenSymbol]
    }
    // Relevant when issuing
    const collateralShortfall = leveragedTokenData.collateralAmount.sub(
      collateralObtainedOrSold
    )
    // Relevant when redeeming
    const leftoverCollateral = leveragedTokenData.collateralAmount.sub(
      collateralObtainedOrSold
    )
    const inputOutputTokenAddress = getPaymentTokenAddress(
      isMinting ? inputToken : outputToken,
      isMinting,
      chainId
    )
    const { swapDataPaymentToken, paymentTokenAmount } =
      await this.getSwapDataAndPaymentTokenAmount(
        indexTokenSymbol,
        leveragedTokenData.collateralToken,
        collateralShortfall,
        leftoverCollateral,
        inputOutputTokenAddress,
        isMinting,
        slippage,
        includedSources,
        chainId
      )

    const estimatedInputOutputAmount = paymentTokenAmount
    const inputOuputTokenDecimals = isMinting
      ? inputToken.decimals
      : outputToken.decimals
    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      inputOuputTokenDecimals,
      slippage,
      isMinting
    )
    return {
      indexTokenAmount,
      inputOutputTokenAmount,
      swapDataDebtCollateral,
      swapDataPaymentToken,
    }
  }

  private async getSwapDataAndPaymentTokenAmount(
    setTokenSymbol: string,
    collateralToken: string,
    collateralShortfall: BigNumber,
    leftoverCollateral: BigNumber,
    paymentTokenAddress: string,
    isMinting: boolean,
    slippage: number,
    includedSources: string,
    chainId: number
  ): Promise<{
    swapDataPaymentToken: SwapData
    paymentTokenAmount: BigNumber
  }> {
    // By default the input/output swap data can be empty (as it will be ignored)
    let swapDataPaymentToken: SwapData = {
      exchange: Exchange.None,
      path: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
      fees: [],
      pool: '0x0000000000000000000000000000000000000000',
    }

    // Default if collateral token should be equal to payment token
    let paymentTokenAmount = isMinting
      ? collateralShortfall
      : leftoverCollateral

    // Only fetch input/output swap data if collateral token is not the same as payment token
    if (
      collateralToken !== paymentTokenAddress &&
      setTokenSymbol !== InterestCompoundingETHIndex.symbol
    ) {
      // TODO: sources
      const quoteRequest: SwapQuoteRequest = {
        inputToken: isMinting ? paymentTokenAddress : collateralToken,
        outputToken: isMinting ? collateralToken : paymentTokenAddress,
        chainId,
        slippage,
      }
      if (isMinting) {
        quoteRequest.outputAmount = paymentTokenAmount.toString()
      } else {
        quoteRequest.inputAmount = paymentTokenAmount.toString()
      }
      const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
      if (result) {
        const { inputAmount, outputAmount, swapData } = result
        swapDataPaymentToken = swapData!
        paymentTokenAmount = isMinting
          ? BigNumber.from(inputAmount)
          : BigNumber.from(outputAmount)
      }
    }

    if (setTokenSymbol === InterestCompoundingETHIndex.symbol) {
      const outputTokenSymbol =
        paymentTokenAddress === stETH.address ? stETH.symbol : ETH.symbol
      // Just use the static versions here
      swapDataPaymentToken = isMinting
        ? inputSwapData[setTokenSymbol][outputTokenSymbol]
        : outputSwapData[setTokenSymbol][ETH.symbol]
    }

    return { swapDataPaymentToken, paymentTokenAmount }
  }
}

// 0x keys https://github.com/0xProject/protocol/blob/4f32f3174f25858644eae4c3de59c3a6717a757c/packages/asset-swapper/src/utils/market_operation_utils/types.ts#L38
function get0xEchangeKey(exchange: Exchange): string {
  switch (exchange) {
    case Exchange.Curve:
      return 'Curve'
    case Exchange.Quickswap:
      return 'QuickSwap'
    case Exchange.Sushiswap:
      return 'SushiSwap'
    case Exchange.UniV3:
      return 'Uniswap_V3'
    default:
      return ''
  }
}

// Returns a comma separated string of sources to be included for 0x API calls
function getIncludedSources(isIcEth: boolean): string {
  const curve = get0xEchangeKey(Exchange.Curve)
  const quickswap = get0xEchangeKey(Exchange.Quickswap)
  const sushi = get0xEchangeKey(Exchange.Sushiswap)
  const uniswap = get0xEchangeKey(Exchange.UniV3)
  const includedSources: string = isIcEth
    ? [curve].toString()
    : [quickswap, sushi, uniswap].toString()
  return includedSources
}

async function getLevTokenData(
  setTokenAddress: string,
  setTokenAmount: BigNumber,
  setTokenSymbol: string,
  isIssuance: boolean,
  chainId: number,
  provider: JsonRpcProvider
): Promise<LeveragedTokenData | null> {
  try {
    const contract = getFlashMintLeveragedContractForToken(
      setTokenSymbol,
      provider,
      chainId
    )
    return await contract.getLeveragedTokenData(
      setTokenAddress,
      setTokenAmount,
      isIssuance
    )
  } catch (error) {
    // TODO: should this just always fail cause it means there is something wrongly configured?
    console.error('Error getting leveraged token data', error)
    return null
  }
}

function getPaymentTokenAddress(
  paymentToken: QuoteToken,
  isMinting: boolean,
  chainId: number
): string {
  if (paymentToken.symbol === ETH.symbol) {
    return 'ETH'
  }

  if (
    paymentToken.symbol === InterestCompoundingETHIndex.symbol &&
    !isMinting
  ) {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return stETH.address!
  }

  if (chainId === ChainId.Polygon && paymentToken.symbol === MATIC.symbol) {
    const WMATIC_ADDRESS = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    return WMATIC_ADDRESS
  }

  return paymentToken.address!
}
