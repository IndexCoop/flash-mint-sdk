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
import {
  getLeveragedTokenData,
  LeveragedTokenData,
} from 'utils/leveraged-token-data'
import { slippageAdjustedTokenAmount } from 'utils/slippage'
import { Exchange, SwapData } from 'utils'

import { QuoteProvider, QuoteToken } from '../../interfaces'
import { SwapQuoteProvider, SwapQuoteRequest } from '../../swap'

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

export class LeveragedQuoteProvider
  implements
    QuoteProvider<FlashMintLeveragedQuoteRequest, FlashMintLeveragedQuote>
{
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getQuote(
    request: FlashMintLeveragedQuoteRequest
  ): Promise<FlashMintLeveragedQuote | null> {
    const { provider } = this
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const isIcEth = indexTokenSymbol === InterestCompoundingETHIndex.symbol
    const sources = getSourcesToInclude(isIcEth)
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const leveragedTokenData = await getLeveragedTokenData(
      indexToken.address,
      indexTokenAmount,
      indexTokenSymbol,
      isMinting,
      chainId,
      provider
    )
    if (leveragedTokenData === null) return null
    const debtCollateralResult = isMinting
      ? await this.getSwapDataDebtToCollateral(
          leveragedTokenData,
          sources,
          slippage,
          chainId
        )
      : await this.getSwapDataCollateralToDebt(
          leveragedTokenData,
          sources,
          slippage,
          chainId
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
        sources,
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

  // Used for redeeming (buy debt, sell collateral)
  // Returns collateral amount needed to be sold
  private async getSwapDataCollateralToDebt(
    leveragedTokenData: LeveragedTokenData,
    includeSources: Exchange[],
    slippage: number,
    chainId: number
  ) {
    const quoteRequest: SwapQuoteRequest = {
      chainId,
      inputToken: leveragedTokenData.collateralToken,
      outputToken: leveragedTokenData.debtToken,
      outputAmount: leveragedTokenData.debtAmount.toString(),
      slippage,
      sources: includeSources,
    }
    const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
    if (!result || !result.swapData) return null
    const { inputAmount, swapData } = result
    const collateralSold = BigNumber.from(inputAmount)
    return {
      swapDataDebtCollateral: swapData,
      collateralObtainedOrSold: collateralSold,
    }
  }

  // Used for minting (buy collateral, sell debt)
  // Returns collateral amount bought
  private async getSwapDataDebtToCollateral(
    leveragedTokenData: LeveragedTokenData,
    includeSources: Exchange[],
    slippage: number,
    chainId: number
  ) {
    const quoteRequest: SwapQuoteRequest = {
      chainId,
      inputToken: leveragedTokenData.debtToken,
      outputToken: leveragedTokenData.collateralToken,
      inputAmount: leveragedTokenData.debtAmount.toString(),
      slippage,
      sources: includeSources,
    }
    const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
    if (!result || !result.swapData) return null
    const { outputAmount, swapData } = result
    const collateralObtained = BigNumber.from(outputAmount)
    return {
      swapDataDebtCollateral: swapData,
      collateralObtainedOrSold: collateralObtained,
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
    includeSources: Exchange[],
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
      const quoteRequest: SwapQuoteRequest = {
        inputToken: isMinting ? paymentTokenAddress : collateralToken,
        outputToken: isMinting ? collateralToken : paymentTokenAddress,
        chainId,
        slippage,
        sources: includeSources,
      }
      if (isMinting) {
        quoteRequest.outputAmount = paymentTokenAmount.toString()
      } else {
        quoteRequest.inputAmount = paymentTokenAmount.toString()
      }
      const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
      if (result && result.swapData) {
        const { inputAmount, outputAmount, swapData } = result
        swapDataPaymentToken = swapData
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

// Returns an array of sources to be included when requesting a swap quote
function getSourcesToInclude(isIcEth: boolean): Exchange[] {
  return isIcEth
    ? [Exchange.Curve]
    : [Exchange.Quickswap, Exchange.Sushiswap, Exchange.UniV3]
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
