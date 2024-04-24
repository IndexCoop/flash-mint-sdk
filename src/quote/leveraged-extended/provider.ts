import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ChainId } from 'constants/chains'
import {
  ETH,
  InterestCompoundingETHIndex,
  MATIC,
  stETH,
} from 'constants/tokens'
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
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
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
    let { swapDataDebtCollateral } = debtCollateralResult
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
      isMinting ? inputToken.symbol : outputToken.symbol,
      isMinting,
      chainId
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
      indexTokenAmount,
      inputOutputTokenAmount,
      swapDataDebtCollateral,
      swapDataPaymentToken,
    }
  }
}

function getPaymentTokenAddress(
  paymentTokenAddress: string,
  paymentTokenSymbol: string,
  isMinting: boolean,
  chainId: number
): string {
  if (paymentTokenSymbol === ETH.symbol) {
    return 'ETH'
  }

  if (paymentTokenSymbol === InterestCompoundingETHIndex.symbol && !isMinting) {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    return stETH.address!
  }

  if (chainId === ChainId.Polygon && paymentTokenSymbol === MATIC.symbol) {
    const WMATIC_ADDRESS = '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
    return WMATIC_ADDRESS
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
