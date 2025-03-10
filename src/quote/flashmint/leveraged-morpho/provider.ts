import { BigNumber } from '@ethersproject/bignumber'

import { AddressZero } from 'constants/addresses'
import { Exchange, getIndexFlashMintLeveragedMorphoContract } from 'utils'
import { getLeveragedTokenData } from 'utils/leveraged-token-data'
import { getRpcProvider } from 'utils/rpc-provider'
import { slippageAdjustedTokenAmount } from 'utils/slippage'

import type { SwapDataV5 } from 'utils'
import type { LeveragedTokenData } from 'utils/leveraged-token-data'
import type { QuoteProvider, QuoteToken } from '../../interfaces'
import type { SwapQuoteProviderV2, SwapQuoteRequestV2 } from '../../swap'

export interface FlashMintLeveragedMorphoRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: string
  outputAmount: string
  slippage: number
  taker: string
}

export interface FlashMintLeveragedMorphoQuote {
  inputAmount: BigNumber
  outputAmount: BigNumber
  swapDataDebtCollateral: SwapDataV5
  swapDataInputOutputToken: SwapDataV5
}

export class LeveragedMorphoQuoteProvider
  implements
    QuoteProvider<
      FlashMintLeveragedMorphoRequest,
      FlashMintLeveragedMorphoQuote
    >
{
  readonly sources = [Exchange.AerodromeSlipstream]
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProviderV2,
  ) {}

  async getQuote(
    request: FlashMintLeveragedMorphoRequest,
  ): Promise<FlashMintLeveragedMorphoQuote | null> {
    const provider = getRpcProvider(this.rpcUrl)
    const {
      chainId,
      inputAmount,
      inputToken,
      isMinting,
      outputAmount,
      outputToken,
      slippage,
      taker,
    } = request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenAmount = BigNumber.from(
      isMinting ? outputAmount : inputAmount,
    )

    const leveragedTokenData = await getLeveragedTokenData(
      indexToken.address,
      indexTokenAmount,
      indexToken.symbol,
      isMinting,
      chainId,
      provider,
    )

    if (leveragedTokenData === null) return null

    const debtCollateralResult = isMinting
      ? await this.getSwapDataDebtToCollateral(
          leveragedTokenData,
          this.sources,
          slippage,
          chainId,
          taker,
        )
      : await this.getSwapDataCollateralToDebt(
          leveragedTokenData,
          this.sources,
          slippage,
          chainId,
          taker,
        )

    if (!debtCollateralResult) return null

    // const { collateralObtainedOrSold } = debtCollateralResult
    const { swapDataDebtCollateral } = debtCollateralResult

    // // Relevant when issuing
    // const collateralShortfall = leveragedTokenData.collateralAmount.sub(
    //   collateralObtainedOrSold,
    // )
    // // Relevant when redeeming
    // const leftoverCollateral = leveragedTokenData.collateralAmount.sub(
    //   collateralObtainedOrSold,
    // )

    // Will be ignored
    const collateralShortfall = BigNumber.from(0)
    const leftoverCollateral = BigNumber.from(0)

    const inputOutputTokenAddress = isMinting
      ? inputToken.address
      : outputToken.address

    const { swapDataInputOutputToken } = await this.getSwapDataInputOutputToken(
      leveragedTokenData.collateralToken,
      collateralShortfall,
      leftoverCollateral,
      inputOutputTokenAddress,
      isMinting,
      slippage,
      taker,
      this.sources,
      chainId,
    )

    let estimatedInputOutputAmount = BigNumber.from(0)
    const contract = getIndexFlashMintLeveragedMorphoContract(provider)
    if (isMinting) {
      estimatedInputOutputAmount = await contract.callStatic.getIssueExactSet(
        indexToken.address,
        indexTokenAmount,
        BigNumber.from(inputAmount),
        swapDataDebtCollateral,
        swapDataInputOutputToken,
      )
    } else {
      estimatedInputOutputAmount = await contract.callStatic.getRedeemExactSet(
        indexToken.address,
        indexTokenAmount,
        swapDataDebtCollateral,
        swapDataInputOutputToken,
      )
    }

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
      outputAmount: isMinting ? indexTokenAmount : inputOutputTokenAmount,
      swapDataDebtCollateral,
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
    taker: string,
  ) {
    const quoteRequest: SwapQuoteRequestV2 = {
      chainId,
      inputToken: leveragedTokenData.collateralToken,
      outputToken: leveragedTokenData.debtToken,
      inputAmount: leveragedTokenData.debtAmount.toString(),
      slippage,
      sources: includeSources,
      taker,
    }
    const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
    if (!result || !result.swapData) return null
    const { outputAmount, swapData } = result
    const collateralSold = BigNumber.from(outputAmount)
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
    taker: string,
  ) {
    const quoteRequest: SwapQuoteRequestV2 = {
      chainId,
      inputToken: leveragedTokenData.debtToken,
      outputToken: leveragedTokenData.collateralToken,
      inputAmount: leveragedTokenData.debtAmount.toString(),
      slippage,
      sources: includeSources,
      taker,
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
    taker: string,
    includeSources: Exchange[],
    chainId: number,
  ): Promise<{
    swapDataInputOutputToken: SwapDataV5
    estimatedInputOutputAmount: BigNumber
  }> {
    // By default the input/output swap data can be empty (as it will be ignored)
    let swapDataInputOutputToken: SwapDataV5 = {
      exchange: Exchange.None,
      path: [],
      fees: [],
      pool: AddressZero,
      poolIds: [],
      tickSpacing: [],
    }

    // Default if collateral token should be equal to input/output token amount
    let estimatedInputOutputAmount = isMinting
      ? collateralShortfall
      : leftoverCollateral

    // Only fetch input/output swap data if collateral token is not the same as payment token
    if (collateralToken !== paymentTokenAddress) {
      const quoteRequest: SwapQuoteRequestV2 = {
        inputToken: isMinting ? paymentTokenAddress : collateralToken,
        outputToken: isMinting ? collateralToken : paymentTokenAddress,
        inputAmount: '0', // is ignored
        chainId,
        slippage, // is ignored
        sources: includeSources,
        taker,
      }
      const result = await this.swapQuoteProvider.getSwapQuote(quoteRequest)
      if (result?.swapData) {
        swapDataInputOutputToken = result.swapData
        // is ignored
        estimatedInputOutputAmount = BigNumber.from(0)
      }
    }

    return { swapDataInputOutputToken, estimatedInputOutputAmount }
  }
}
