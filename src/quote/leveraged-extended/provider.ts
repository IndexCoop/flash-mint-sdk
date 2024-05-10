import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ETH, InterestCompoundingETHIndex } from 'constants/tokens'
import { ZeroExApi } from 'utils/0x'
import { slippageAdjustedTokenAmount } from 'utils/slippage'
import {
  Exchange,
  getSwapDataCollateralDebt,
  getSwapDataDebtCollateral,
  getSwapData,
  SwapData,
} from 'utils/swapData'

import { QuoteProvider } from '../quoteProvider'
import { QuoteToken } from '../quoteToken'

import { getLeveragedTokenData } from './utils/data'
import { getIncludedSources } from './utils/zeroex'

export interface FlashMintLeveragedExtendedQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  slippage: number
}

export interface FlashMintLeveragedExtendedQuote {
  inputTokenAmount: BigNumber
  outputTokenAmount: BigNumber
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

export class LeveragedExtendedQuoteProvider
  implements
    QuoteProvider<
      FlashMintLeveragedExtendedQuoteRequest,
      FlashMintLeveragedExtendedQuote
    >
{
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly zeroExApi: ZeroExApi
  ) {}

  async getQuote(
    request: FlashMintLeveragedExtendedQuoteRequest
  ): Promise<FlashMintLeveragedExtendedQuote | null> {
    const { provider, zeroExApi } = this
    const { indexTokenAmount, inputToken, isMinting, outputToken, slippage } =
      request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const includedSources = getIncludedSources()
    const network = await provider.getNetwork()
    const chainId = network.chainId
    console.log('chainId:', chainId)

    const leveragedTokenData = await getLeveragedTokenData(
      indexToken.address,
      indexTokenAmount,
      indexTokenSymbol,
      isMinting,
      chainId,
      provider
    )
    console.log(leveragedTokenData)
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
    const { swapDataDebtCollateral } = debtCollateralResult
    // Relevant when issuing
    const collateralShortfall = leveragedTokenData.collateralAmount.sub(
      collateralObtainedOrSold
    )
    // Relevant when redeeming
    const leftoverCollateral = leveragedTokenData.collateralAmount.sub(
      collateralObtainedOrSold
    )
    const inputOutputTokenAddress = getPaymentTokenAddress(
      isMinting ? inputToken.address : outputToken.address,
      isMinting ? inputToken.symbol : outputToken.symbol
    )
    const { swapDataPaymentToken, paymentTokenAmount } =
      await getSwapDataAndPaymentTokenAmount(
        indexTokenSymbol,
        leveragedTokenData.collateralToken,
        collateralShortfall,
        leftoverCollateral,
        inputOutputTokenAddress,
        isMinting,
        slippage,
        includedSources,
        zeroExApi,
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
      inputTokenAmount: isMinting ? inputOutputTokenAmount : indexTokenAmount,
      outputTokenAmount: isMinting ? indexTokenAmount : inputOutputTokenAmount,
      indexTokenAmount,
      inputOutputTokenAmount,
      swapDataDebtCollateral,
      swapDataPaymentToken,
    }
  }
}

function getPaymentTokenAddress(
  paymentTokenAddress: string,
  paymentTokenSymbol: string
): string {
  if (paymentTokenSymbol === ETH.symbol) {
    return 'ETH'
  }
  return paymentTokenAddress
}

async function getSwapDataAndPaymentTokenAmount(
  setTokenSymbol: string,
  collateralToken: string,
  collateralShortfall: BigNumber,
  leftoverCollateral: BigNumber,
  paymentTokenAddress: string,
  isMinting: boolean,
  slippage: number,
  includedSources: string,
  zeroExApi: ZeroExApi,
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

  const issuanceParams = {
    buyToken: collateralToken,
    buyAmount: collateralShortfall.toString(),
    sellToken: paymentTokenAddress,
    includedSources,
  }

  const redeemingParams = {
    buyToken: paymentTokenAddress,
    sellAmount: leftoverCollateral.toString(),
    sellToken: collateralToken,
    includedSources,
  }

  // Default if collateral token should be equal to payment token
  let paymentTokenAmount = isMinting ? collateralShortfall : leftoverCollateral

  // Only fetch input/output swap data if collateral token is not the same as payment token
  if (
    collateralToken !== paymentTokenAddress &&
    setTokenSymbol !== InterestCompoundingETHIndex.symbol
  ) {
    const result = await getSwapData(
      isMinting ? issuanceParams : redeemingParams,
      slippage,
      chainId,
      zeroExApi
    )
    if (result) {
      const { swapData, zeroExQuote } = result
      swapDataPaymentToken = swapData
      paymentTokenAmount = isMinting
        ? BigNumber.from(zeroExQuote.sellAmount)
        : BigNumber.from(zeroExQuote.buyAmount)
    }
  }

  return { swapDataPaymentToken, paymentTokenAmount }
}
