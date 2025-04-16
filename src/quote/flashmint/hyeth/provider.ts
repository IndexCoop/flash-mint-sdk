import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { slippageAdjustedTokenAmount } from 'utils'
import { ComponentQuotesProvider } from './component-quotes'
import { getRequiredComponents } from './issuance'
import {
  getComponentsSwapData,
  getEthToInputOutputTokenSwapData,
  getInputTokenToEthSwapData,
} from './swap-data'

import type { QuoteProvider, QuoteToken, Result } from 'quote/interfaces'
import type { SwapQuoteProviderV2 } from 'quote/swap'
import type { SwapData } from 'utils'

export interface FlashMintHyEthQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: bigint
  inputAmount: bigint
  slippage: number
}

export interface FlashMintHyEthQuote {
  indexTokenAmount: bigint
  inputOutputTokenAmount: bigint
  // Represents `swapDataEthToComponent` for minting
  // and `swapDataComponentToEth` for redeeming
  componentsSwapData: SwapData[]
  // Used only for minting w/ ERC-20 tokens
  swapDataInputTokenToEth: SwapData | null
  // Represents `swapDataEthToInputToken` for minting w/ ERC-20 token
  // and `swapDataEthToOutputToken` for redeeming to ERC-20 token
  swapDataEthToInputOutputToken: SwapData | null
}

export class FlashMintHyEthQuoteProvider
  implements QuoteProvider<FlashMintHyEthQuoteRequest, FlashMintHyEthQuote>
{
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProviderV2,
    // If provided, this provider will be used to fetch quotes for output amounts
    private readonly swapQuoteOutputProvider?: SwapQuoteProviderV2,
  ) {}

  async getQuote(
    request: FlashMintHyEthQuoteRequest,
  ): Promise<Result<FlashMintHyEthQuote>> {
    const {
      indexTokenAmount,
      inputAmount,
      inputToken,
      isMinting,
      outputToken,
      slippage,
    } = request

    // Only relevant for minting ERC-20's
    const swapDataInputTokenToEth = isMinting
      ? getInputTokenToEthSwapData(inputToken)
      : null
    const swapDataEthToInputOutputToken = getEthToInputOutputTokenSwapData(
      isMinting ? inputToken : outputToken,
    )

    const { components, positions } = await getRequiredComponents(
      request,
      this.rpcUrl,
    )

    const componentsSwapData = getComponentsSwapData(components)

    if (componentsSwapData.length !== components.length) {
      return {
        success: false,
        error: {
          code: 'ComponentsSwapDataError',
          message: 'Components swap data length mismatch',
        },
      }
    }

    // Mainnet only for now
    const chainId = 1
    const wethAddress = getTokenByChainAndSymbol(chainId, 'WETH').address
    const quoteProvider = new ComponentQuotesProvider(
      chainId,
      slippage,
      wethAddress,
      this.rpcUrl,
      this.swapQuoteProvider,
      this.swapQuoteOutputProvider,
    )
    const quoteResult = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken,
      inputAmount,
    )

    if (!quoteResult) {
      return {
        success: false,
        error: {
          code: 'ComponentQuotesError',
          message: 'Error fetching component quotes',
        },
      }
    }

    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      BigNumber.from(quoteResult.inputOutputTokenAmount.toString()),
      isMinting ? inputToken.decimals : outputToken.decimals,
      slippage,
      isMinting,
    )

    return {
      success: true,
      data: {
        indexTokenAmount,
        inputOutputTokenAmount: inputOutputTokenAmount.toBigInt(),
        componentsSwapData,
        swapDataInputTokenToEth,
        swapDataEthToInputOutputToken,
      },
    }
  }
}
