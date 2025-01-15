import { BigNumber } from '@ethersproject/bignumber'

import { ETH } from 'constants/tokens'
import { Exchange } from 'utils'
import { getLeveragedTokenData } from 'utils/leveraged-token-data'
import { getRpcProvider } from 'utils/rpc-provider'
import { slippageAdjustedTokenAmount } from 'utils/slippage'

import type { SwapDataV3 } from 'utils'
import type { LeveragedTokenData } from 'utils/leveraged-token-data'
import type { QuoteProvider, QuoteToken } from '../../interfaces'
import type { SwapQuoteProvider, SwapQuoteRequest } from '../../swap'

export interface FlashMintLeveragedAerodromeQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: string
  outputAmount: string
  slippage: number
}

export interface FlashMintLeveragedAerodromeQuote {
  inputAmount: BigNumber
  ouputAmount: BigNumber
  swapDataDebtCollateral: SwapDataV3
  swapDataInputOutputToken: SwapDataV3
}

export class LeveragedAerodromeQuoteProvider
  implements
    QuoteProvider<
      FlashMintLeveragedAerodromeQuoteRequest,
      FlashMintLeveragedAerodromeQuote
    >
{
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider,
  ) {}

  async getQuote(
    request: FlashMintLeveragedAerodromeQuoteRequest,
  ): Promise<FlashMintLeveragedAerodromeQuote | null> {
    const provider = getRpcProvider(this.rpcUrl)
    const {
      chainId,
      inputAmount,
      inputToken,
      isMinting,
      outputAmount,
      outputToken,
      slippage,
    } = request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenAmount = BigNumber.from(
      isMinting ? outputAmount : inputAmount,
    )
    const indexTokenSymbol = indexToken.symbol
    const sources = [Exchange.Sushiswap, Exchange.UniV3]
    const leveragedTokenData = await getLeveragedTokenData(
      indexToken.address,
      indexTokenAmount,
      indexTokenSymbol,
      isMinting,
      chainId,
      provider,
    )
    if (leveragedTokenData === null) return null
    const debtCollateralResult = isMinting
      ? await this.getSwapDataDebtToCollateral(
          leveragedTokenData,
          sources,
          slippage,
          chainId,
        )
      : await this.getSwapDataCollateralToDebt(
          leveragedTokenData,
          sources,
          slippage,
          chainId,
        )

    if (!debtCollateralResult) return null

    const { collateralObtainedOrSold } = debtCollateralResult
    const { swapDataDebtCollateral } = debtCollateralResult

    // Relevant when issuing
    const collateralShortfall = leveragedTokenData.collateralAmount.sub(
      collateralObtainedOrSold,
    )
    // Relevant when redeeming
    const leftoverCollateral = leveragedTokenData.collateralAmount.sub(
      collateralObtainedOrSold,
    )
    const inputOutputTokenAddress = getPaymentTokenAddress(
      isMinting ? inputToken.address : outputToken.address,
      isMinting ? inputToken.symbol : outputToken.symbol,
    )

    const { swapDataInputOutputToken, estimatedInputOutputAmount } =
      await this.getSwapDataInputOutputToken(
        leveragedTokenData.collateralToken,
        collateralShortfall,
        leftoverCollateral,
        inputOutputTokenAddress,
        isMinting,
        slippage,
        sources,
        chainId,
      )

    const inputOuputTokenDecimals = isMinting
      ? inputToken.decimals
      : outputToken.decimals
    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      inputOuputTokenDecimals,
      slippage,
      isMinting,
    )

    return {
      inputAmount: isMinting ? inputOutputTokenAmount : indexTokenAmount,
      ouputAmount: isMinting ? indexTokenAmount : inputOutputTokenAmount,
      swapDataDebtCollateral: { ...swapDataDebtCollateral, poolIds: [] },
      swapDataInputOutputToken,
    }
  }

  // Used for redeeming (buy debt, sell collateral)
  // Returns collateral amount needed to be sold
  private async getSwapDataCollateralToDebt(
    leveragedTokenData: LeveragedTokenData,
    includeSources: Exchange[],
    slippage: number,
    chainId: number,
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
    chainId: number,
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

  private async getSwapDataInputOutputToken(
    collateralToken: string,
    collateralShortfall: BigNumber,
    leftoverCollateral: BigNumber,
    paymentTokenAddress: string,
    isMinting: boolean,
    slippage: number,
    includeSources: Exchange[],
    chainId: number,
  ): Promise<{
    swapDataInputOutputToken: SwapDataV3
    estimatedInputOutputAmount: BigNumber
  }> {
    // By default the input/output swap data can be empty (as it will be ignored)
    let swapDataInputOutputToken: SwapDataV3 = {
      exchange: Exchange.None,
      path: [
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
      ],
      fees: [],
      pool: '0x0000000000000000000000000000000000000000',
      poolIds: [],
    }

    // Default if collateral token should be equal to input/output token amount
    let estimatedInputOutputAmount = isMinting
      ? collateralShortfall
      : leftoverCollateral

    // Only fetch input/output swap data if collateral token is not the same as payment token
    if (collateralToken !== paymentTokenAddress) {
      const quoteRequest: SwapQuoteRequest = {
        inputToken: isMinting ? paymentTokenAddress : collateralToken,
        outputToken: isMinting ? collateralToken : paymentTokenAddress,
        chainId,
        slippage,
        sources: includeSources,
      }
      if (isMinting) {
        quoteRequest.outputAmount = estimatedInputOutputAmount.toString()
      } else {
        quoteRequest.inputAmount = estimatedInputOutputAmount.toString()
      }
      const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
      if (result?.swapData) {
        const { inputAmount, outputAmount, swapData } = result
        swapDataInputOutputToken = { ...swapData, poolIds: [] }
        estimatedInputOutputAmount = isMinting
          ? BigNumber.from(inputAmount)
          : BigNumber.from(outputAmount)
      }
    }

    return { swapDataInputOutputToken, estimatedInputOutputAmount }
  }
}

function getPaymentTokenAddress(
  paymentTokenAddress: string,
  paymentTokenSymbol: string,
): string {
  if (paymentTokenSymbol === ETH.symbol) {
    return 'ETH'
  }
  return paymentTokenAddress
}
