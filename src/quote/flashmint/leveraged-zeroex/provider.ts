import { BigNumber } from '@ethersproject/bignumber'
import {
  getTokenByChainAndAddress,
  isAddressEqual,
} from '@indexcoop/tokenlists'

import { AddressZero, HashZero } from 'constants/addresses'
import { getSellAmount } from 'quote/flashmint/leveraged-zeroex/utils'
import { getTokenAddressOrWeth } from 'utils'
import { usesAaveLeverageModule } from 'utils/leverage-module'
import {
  type LeveragedZeroExTokenData,
  getLeveragedZeroExTokenData,
} from 'utils/leveraged-token-data'
import { slippageAdjustedTokenAmount } from 'utils/slippage'

import type { SwapDataV2 } from 'utils'
import type { Address } from 'viem'
import type { QuoteProvider, QuoteToken } from '../../interfaces'
import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
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
  ): Promise<FlashMintLeveragedZeroExQuote | null> {
    const { chainId, inputToken, isMinting, outputToken, slippage } = request

    const indexTokenAmount = BigNumber.from(
      isMinting ? request.outputAmount : request.inputAmount,
    )
    const indexToken = isMinting ? outputToken : inputToken

    const isAave = await usesAaveLeverageModule(
      indexToken.address,
      chainId,
      this.rpcUrl,
    )
    console.log(isAave, 'isAave')

    const leveragedTokenData = await getLeveragedZeroExTokenData(
      {
        indexTokenAddress: indexToken.address as Address,
        indexTokenAmount: indexTokenAmount.toBigInt(),
        isIssuance: isMinting,
        isAave,
      },
      chainId,
      this.rpcUrl,
    )
    console.log(leveragedTokenData)

    if (leveragedTokenData === null) return null

    const debtCollateralResult = isMinting
      ? await this.getSwapDataDebtToCollateral(leveragedTokenData, request)
      : await this.getSwapDataCollateralToDebt(leveragedTokenData, request)
    console.log(debtCollateralResult)

    if (!debtCollateralResult) return null

    const { collateralObtainedOrSold, swapDataDebtCollateral } =
      debtCollateralResult

    const { swapDataInputOutputToken, estimatedInputOutputAmount } =
      await this.getSwapDataInputOutputToken(
        request,
        leveragedTokenData,
        collateralObtainedOrSold,
      )

    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      isMinting ? inputToken.decimals : outputToken.decimals,
      slippage,
      isMinting,
    )

    return {
      inputAmount: (isMinting
        ? inputOutputTokenAmount
        : indexTokenAmount
      ).toString(),
      outputAmount: (isMinting
        ? indexTokenAmount
        : inputOutputTokenAmount
      ).toString(),
      swapDataDebtCollateral,
      swapDataInputOutputToken,
      isAave,
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

    let result: SwapQuoteV2 | null = null

    if (this.swapQuoteOutputProvider) {
      const quoteRequest: SwapQuoteRequestV2 = {
        chainId,
        inputToken: leveragedTokenData.collateralToken,
        outputToken: leveragedTokenData.debtToken,
        outputAmount: targetBuyAmount.toString(),
        slippage,
        taker,
      }

      result = await this.swapQuoteOutputProvider.getSwapQuote(quoteRequest)
    } else {
      const sellAmount = await getSellAmount(
        chainId,
        leveragedTokenData.collateralToken,
        leveragedTokenData.debtToken,
        targetBuyAmount,
        minBuyAmount,
        maxBuyAmount,
        BigNumber.from(leveragedTokenData.collateralAmount.toString()),
      )

      const quoteRequest: SwapQuoteRequestV2 = {
        chainId,
        inputToken: leveragedTokenData.collateralToken,
        outputToken: leveragedTokenData.debtToken,
        inputAmount: sellAmount.toString(),
        slippage,
        taker,
      }

      result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
    }

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
    console.log(
      outputAmountAdjusted.toString(),
      outputAmount.toString(),
      'outputAmountAdjusted',
    )
    const roundingFactor = BigNumber.from(outputAmountAdjusted).div(1000)
    const roundedDebtAmount = BigNumber.from(debtAmount.toString())
      .div(roundingFactor)
      .add(1)
      .mul(roundingFactor)

    console.log(
      debtAmount.toString(),
      roundedDebtAmount.toString(),
      'roundedDebtAmount',
    )
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
    console.log(result)
    if (!result || !result.swapData) return null
    const collateralObtained = BigNumber.from(result.outputAmount)
    return {
      swapDataDebtCollateral: result.swapData,
      collateralObtainedOrSold: collateralObtained,
    }
  }

  private async getSwapDataInputOutputToken(
    request: FlashMintLeveragedZeroExQuoteRequest,
    leveragedTokenData: LeveragedZeroExTokenData,
    collateralObtainedOrSold: BigNumber,
  ): Promise<{
    swapDataInputOutputToken: SwapDataV2
    estimatedInputOutputAmount: BigNumber
  }> {
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

    // By default the input/output swap data can be empty (as it would be ignored)
    let swapDataInputOutputToken: SwapDataV2 = {
      swapTarget: AddressZero,
      callData: HashZero,
    }

    console.log(
      collateralAmount.toString(),
      collateralObtainedOrSold.toString(),
      'collateral',
    )

    // Relevant when issuing
    const collateralShortfall = BigNumber.from(collateralAmount).sub(
      collateralObtainedOrSold,
    )
    // Relevant when redeeming
    const leftoverCollateral = BigNumber.from(collateralAmount.toString()).sub(
      collateralObtainedOrSold,
    )

    // Default if collateral token should be equal to input/output token
    let estimatedInputOutputAmount = isMinting
      ? collateralShortfall
      : leftoverCollateral

    // We gotta use WETH if input token is ETH
    const inputTokenAddress = getTokenAddressOrWeth(inputToken.address, chainId)
    const outputTokenAddress = getTokenAddressOrWeth(
      outputToken.address,
      chainId,
    )
    const inputOutputToken = isMinting ? inputTokenAddress : outputTokenAddress

    console.log(
      estimatedInputOutputAmount.toString(),
      inputOutputToken,
      collateralToken,
      isMinting,
    )

    // Only fetch input/output swap data if collateral token is not the same as payment token
    if (
      !isAddressEqual(inputOutputToken, collateralToken) // TOOD: && setTokenSymbol !== InterestCompoundingETHIndex.symbol
    ) {
      if (isMinting) {
        const targetBuyAmount = collateralShortfall.mul(1005).div(1000)
        const minBuyAmount = collateralShortfall
        const maxBuyAmount = collateralShortfall.mul(101).div(100)

        let result: SwapQuoteV2 | null = null

        if (this.swapQuoteOutputProvider) {
          const quoteRequest: SwapQuoteRequestV2 = {
            chainId,
            inputToken: inputTokenAddress,
            outputToken: collateralToken,
            outputAmount: targetBuyAmount.toString(),
            slippage,
            taker,
          }

          result = await this.swapQuoteOutputProvider.getSwapQuote(quoteRequest)
        } else {
          const sellAmount = await getSellAmount(
            chainId,
            inputTokenAddress,
            collateralToken,
            targetBuyAmount,
            minBuyAmount,
            maxBuyAmount,
            BigNumber.from(inputAmount),
          )

          console.log(sellAmount.toString(), 'sellAmount')
          const quoteRequest: SwapQuoteRequestV2 = {
            chainId,
            inputToken: inputTokenAddress,
            outputToken: collateralToken,
            inputAmount: sellAmount.toString(),
            slippage,
            taker,
          }

          result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
        }

        if (result?.swapData) {
          const { inputAmount, outputAmount, swapData } = result
          swapDataInputOutputToken = swapData
          estimatedInputOutputAmount = isMinting
            ? BigNumber.from(inputAmount)
            : BigNumber.from(outputAmount)
        }
      } else {
        const quoteRequest: SwapQuoteRequestV2 = {
          inputToken: collateralToken,
          outputToken: outputTokenAddress,
          chainId,
          slippage,
          inputAmount: estimatedInputOutputAmount.toString(),
          sellEntireBalance: true,
          taker,
        }
        const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
        if (result?.swapData) {
          const { inputAmount, outputAmount, swapData } = result
          swapDataInputOutputToken = swapData
          estimatedInputOutputAmount = isMinting
            ? BigNumber.from(inputAmount)
            : BigNumber.from(outputAmount)
        }
      }
    }

    return { swapDataInputOutputToken, estimatedInputOutputAmount }
  }
}
