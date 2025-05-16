import { BigNumber } from '@ethersproject/bignumber'
import {
  getTokenByChainAndAddress,
  getTokenByChainAndSymbol,
  isAddressEqual,
} from '@indexcoop/tokenlists'

import { AddressZero, HashZero } from 'constants/addresses'
import { getFallbackQuote } from 'quote/flashmint/leveraged-zeroex/fallback'
import { getTokenAddressOrWeth } from 'utils'
import { usesAaveLeverageModule } from 'utils/leverage-module'
import {
  type LeveragedZeroExTokenData,
  getLeveragedZeroExTokenData,
} from 'utils/leveraged-token-data'
import { slippageAdjustedTokenAmount } from 'utils/slippage'

export enum LeveragedZeroExErrorCode {
  IS_AAVE_NULL = 'IS_AAVE_NULL',
  LEVERAGED_TOKEN_DATA_NULL = 'LEVERAGED_TOKEN_DATA_NULL',
  DEBT_COLLATERAL_SWAP_DATA_NULL = 'DEBT_COLLATERAL_SWAP_DATA_NULL',
  INPUT_OUTPUT_SWAP_DATA_NULL = 'INPUT_OUTPUT_SWAP_DATA_NULL',
}

import type { SwapDataV2 } from 'utils'
import type { Address } from 'viem'
import type { QuoteProvider, QuoteToken, Result } from '../../interfaces'
import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
  ZeroExV2SwapQuoteProvider,
} from '../../swap'

export interface FlashMintLeveragedZeroExQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: string
  outputAmount: string
  slippage: number
  taker: string
}

export interface FlashMintLeveragedZeroExQuote {
  inputAmount: string
  outputAmount: string
  quoteAmount: string
  swapDataDebtCollateral: SwapDataV2
  swapDataInputOutputToken: SwapDataV2
  isAave: boolean
}

export class LeveragedZeroExQuoteProvider
  implements
    QuoteProvider<
      FlashMintLeveragedZeroExQuoteRequest,
      FlashMintLeveragedZeroExQuote
    >
{
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProviderV2,
    // If provided, this provider will be used to fetch quotes for output amounts
    private readonly swapQuoteOutputProvider?: SwapQuoteProviderV2,
  ) {}

  async getQuote(
    request: FlashMintLeveragedZeroExQuoteRequest,
  ): Promise<Result<FlashMintLeveragedZeroExQuote>> {
    const { chainId, inputToken, isMinting, outputToken, slippage } = request

    const indexTokenAmount = BigNumber.from(
      isMinting ? request.outputAmount : request.inputAmount,
    )
    const indexToken = isMinting ? outputToken : inputToken

    const isAaveResult = await usesAaveLeverageModule(
      indexToken.address,
      chainId,
      this.rpcUrl,
    )

    if (!isAaveResult.success) {
      return {
        success: false,
        error: {
          code: LeveragedZeroExErrorCode.IS_AAVE_NULL,
          message: 'Error fetching AAVE status',
          originalError: isAaveResult.error,
        },
      }
    }

    const isAave = isAaveResult.data

    const leveragedTokenDataResult = await getLeveragedZeroExTokenData(
      {
        indexTokenAddress: indexToken.address as Address,
        indexTokenAmount: indexTokenAmount.toBigInt(),
        isIssuance: isMinting,
        isAave,
      },
      chainId,
      this.rpcUrl,
    )

    if (!leveragedTokenDataResult.success) {
      return {
        success: false,
        error: {
          code: LeveragedZeroExErrorCode.LEVERAGED_TOKEN_DATA_NULL,
          message: 'Error fetching leveraged token data',
          originalError: leveragedTokenDataResult.error,
        },
      }
    }

    const leveragedTokenData = leveragedTokenDataResult.data

    if (!leveragedTokenData) {
      return {
        success: false,
        error: {
          code: LeveragedZeroExErrorCode.LEVERAGED_TOKEN_DATA_NULL,
          message: 'Error leveraged token data is null',
        },
      }
    }

    const debtCollateralResult = isMinting
      ? await this.getSwapDataDebtToCollateral(leveragedTokenData, request)
      : await this.getSwapDataCollateralToDebt(leveragedTokenData, request)

    if (!debtCollateralResult)
      return {
        success: false,
        error: {
          code: LeveragedZeroExErrorCode.DEBT_COLLATERAL_SWAP_DATA_NULL,
          message: 'Error fetching debt/collateral swap data',
        },
      }

    const { collateralObtainedOrSold, swapDataDebtCollateral } =
      debtCollateralResult

    const swapDataInputOutputTokenResult =
      await this.getSwapDataInputOutputToken(
        request,
        leveragedTokenData,
        collateralObtainedOrSold,
      )

    if (!swapDataInputOutputTokenResult)
      return {
        success: false,
        error: {
          code: LeveragedZeroExErrorCode.INPUT_OUTPUT_SWAP_DATA_NULL,
          message: 'Error fetching input/output swap data',
        },
      }

    const { swapDataInputOutputToken, estimatedInputOutputAmount } =
      swapDataInputOutputTokenResult

    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      isMinting ? inputToken.decimals : outputToken.decimals,
      slippage,
      isMinting,
    )

    return {
      success: true,
      data: {
        inputAmount: (isMinting
          ? inputOutputTokenAmount
          : indexTokenAmount
        ).toString(),
        outputAmount: (isMinting
          ? indexTokenAmount
          : inputOutputTokenAmount
        ).toString(),
        quoteAmount: estimatedInputOutputAmount.toString(),
        swapDataDebtCollateral,
        swapDataInputOutputToken,
        isAave,
      },
    }
  }

  // Used for redeeming (buy debt, sell collateral)
  // Returns collateral amount needed to be sold
  private async getSwapDataCollateralToDebt(
    leveragedTokenData: LeveragedZeroExTokenData,
    request: FlashMintLeveragedZeroExQuoteRequest,
  ) {
    const { chainId, slippage, taker } = request

    const debtAmount = BigNumber.from(leveragedTokenData.debtAmount.toString())
    const targetBuyAmount = debtAmount.mul(1001).div(1000)
    const minBuyAmount = debtAmount
    const maxBuyAmount = debtAmount.mul(1005).div(1000)

    const inputToken = leveragedTokenData.collateralToken
    const outputToken = leveragedTokenData.debtToken

    let outputQuotePromise = null
    if (this.swapQuoteOutputProvider) {
      const quoteRequest: SwapQuoteRequestV2 = {
        chainId,
        inputToken,
        outputToken,
        outputAmount: targetBuyAmount.toString(),
        slippage,
        taker,
      }

      outputQuotePromise =
        this.swapQuoteOutputProvider.getSwapQuote(quoteRequest)
    }

    // Fallback in case LiFi doesn't return a output amount quote - or is not set.
    const fallbackQuotePromise = getFallbackQuote(
      inputToken,
      outputToken,
      targetBuyAmount,
      minBuyAmount,
      maxBuyAmount,
      BigNumber.from(leveragedTokenData.collateralAmount.toString()),
      request,
      this.swapQuoteProvider as ZeroExV2SwapQuoteProvider,
    )

    // Should await quoteOutputPromise first and only wait for fallback promise if first one returns nullish value
    const result: SwapQuoteV2 | null =
      (await outputQuotePromise) ?? (await fallbackQuotePromise)

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
    leveragedTokenData: LeveragedZeroExTokenData,
    request: FlashMintLeveragedZeroExQuoteRequest,
  ) {
    const { chainId, outputAmount, outputToken, slippage, taker } = request
    const { collateralToken, debtAmount, debtToken } = leveragedTokenData
    const debtTokenTokenlist = getTokenByChainAndAddress(chainId, debtToken)
    // We want to force, so that missing tokens will throw an error
    const decimals = debtTokenTokenlist!.decimals
    const adjustDecimals = outputToken.decimals !== decimals
    const outputAmountAdjusted = adjustDecimals
      ? BigNumber.from(outputAmount).div(
          BigNumber.from(10).pow(outputToken.decimals - decimals),
        )
      : outputAmount
    const roundingFactor = BigNumber.from(outputAmountAdjusted).div(1000)
    const roundedDebtAmount = BigNumber.from(debtAmount.toString())
      .div(roundingFactor)
      .add(1)
      .mul(roundingFactor)

    const quoteRequest: SwapQuoteRequestV2 = {
      chainId,
      inputToken: debtToken,
      outputToken: collateralToken,
      inputAmount: roundedDebtAmount.toString(),
      slippage,
      sellEntireBalance: true,
      taker,
    }

    const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)

    if (!result || !result.swapData) return null

    return {
      swapDataDebtCollateral: result.swapData,
      collateralObtainedOrSold: BigNumber.from(result.outputAmount),
    }
  }

  private async getSwapDataInputOutputToken(
    request: FlashMintLeveragedZeroExQuoteRequest,
    leveragedTokenData: LeveragedZeroExTokenData,
    collateralObtainedOrSold: BigNumber,
  ): Promise<{
    swapDataInputOutputToken: SwapDataV2
    estimatedInputOutputAmount: BigNumber
  } | null> {
    const {
      chainId,
      inputAmount,
      inputToken,
      isMinting,
      outputToken,
      slippage,
      taker,
    } = request
    const { collateralAmount, collateralToken } = leveragedTokenData

    // Relevant when issuing
    const collateralShortfall = BigNumber.from(collateralAmount).sub(
      collateralObtainedOrSold,
    )
    // Relevant when redeeming
    const leftoverCollateral = BigNumber.from(collateralAmount.toString()).sub(
      collateralObtainedOrSold,
    )

    // Default if collateral token should be equal to input/output token
    const estimatedInputOutputAmount = isMinting
      ? collateralShortfall
      : leftoverCollateral

    // We gotta use WETH if input token is ETH
    const inputTokenAddress = getTokenAddressOrWeth(inputToken.address, chainId)
    const outputTokenAddress = getTokenAddressOrWeth(
      outputToken.address,
      chainId,
    )
    const inputOutputToken = isMinting ? inputTokenAddress : outputTokenAddress

    // Only fetch input/output swap data if collateral token is not the same as payment token
    if (!isAddressEqual(inputOutputToken, collateralToken)) {
      if (isMinting) {
        const targetBuyAmount = collateralShortfall.mul(1005).div(1000)
        const minBuyAmount = collateralShortfall
        const maxBuyAmount = collateralShortfall.mul(101).div(100)

        const inputToken = inputTokenAddress
        const outputToken = collateralToken

        let quoteOutputPromise = null
        if (this.swapQuoteOutputProvider) {
          const quoteRequest: SwapQuoteRequestV2 = {
            chainId,
            inputToken,
            outputToken,
            outputAmount: targetBuyAmount.toString(),
            slippage,
            taker,
          }

          quoteOutputPromise =
            this.swapQuoteOutputProvider.getSwapQuote(quoteRequest)
        }

        // Fallback in case LiFi doesn't return a output amount quote - or is not set.
        const fallbackQuotePromise = getFallbackQuote(
          inputToken,
          outputToken,
          targetBuyAmount,
          minBuyAmount,
          maxBuyAmount,
          BigNumber.from(inputAmount),
          request,
          this.swapQuoteProvider as ZeroExV2SwapQuoteProvider,
        )

        // Should await quoteOutputPromise first and only wait for fallback promise
        // if first one returns nullish value
        const result: SwapQuoteV2 | null =
          (await quoteOutputPromise) ?? (await fallbackQuotePromise)

        return getSwapDataInputOutputResultOrNull(result, isMinting)
      } else {
        const isStEth = isAddressEqual(
          collateralToken,
          getTokenByChainAndSymbol(1, 'stETH').address,
        )
        // Smol hack to make stETH work with sellEntireBalance
        const requestInputAmout = isStEth
          ? estimatedInputOutputAmount.mul(1000).div(1010)
          : estimatedInputOutputAmount
        const quoteRequest: SwapQuoteRequestV2 = {
          inputToken: collateralToken,
          outputToken: outputTokenAddress,
          chainId,
          slippage,
          inputAmount: requestInputAmout.toString(),
          sellEntireBalance: true,
          taker,
        }
        const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)

        return getSwapDataInputOutputResultOrNull(result, isMinting)
      }
    } else {
      // Collateral token is the same as input/output token
      const swapDataInputOutputToken: SwapDataV2 = {
        swapTarget: AddressZero,
        callData: HashZero,
      }
      return { swapDataInputOutputToken, estimatedInputOutputAmount }
    }
  }
}

function getSwapDataInputOutputResultOrNull(
  result: SwapQuoteV2 | null,
  isMinting: boolean,
) {
  if (!result || !result.swapData) return null

  const estimatedInputOutputAmount = isMinting
    ? BigNumber.from(result.inputAmount)
    : BigNumber.from(result.outputAmount)

  return {
    swapDataInputOutputToken: result.swapData,
    estimatedInputOutputAmount,
  }
}
