import { WETH } from 'constants/tokens'
import { QuoteProvider, QuoteToken } from 'quote/interfaces'
import { SwapQuoteProvider } from 'quote/swap'
import { SwapData } from 'utils'

import { ComponentQuotesProvider } from './component-quotes'
import { getRequiredComponents } from './issuance'
import {
  getComponentsSwapData,
  getEthToInputOutputTokenSwapData,
  getInputTokenToEthSwapData,
} from './swap-data'

export interface FlashMintHyEthQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: bigint
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
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getQuote(
    request: FlashMintHyEthQuoteRequest
  ): Promise<FlashMintHyEthQuote | null> {
    const { indexTokenAmount, inputToken, isMinting, outputToken, slippage } =
      request
    const componentsSwapData = getComponentsSwapData()
    // Only relevant for minting ERC-20's
    const swapDataInputTokenToEth = isMinting
      ? getInputTokenToEthSwapData(inputToken)
      : null
    const inputOutputToken = isMinting ? inputToken : outputToken
    const swapDataEthToInputOutputToken =
      getEthToInputOutputTokenSwapData(inputOutputToken)

    const { components, positions } = await getRequiredComponents(
      request,
      this.rpcUrl
    )

    if (componentsSwapData.length !== components.length) return null

    // Mainnet only for now
    const chainId = 1
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const wethAddress = WETH.address!
    const quoteProvider = new ComponentQuotesProvider(
      chainId,
      slippage,
      wethAddress,
      this.rpcUrl,
      this.swapQuoteProvider
    )
    const quoteResult = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (!quoteResult) return null
    const inputOutputTokenAmount = quoteResult.inputOutputTokenAmount
    return {
      indexTokenAmount,
      inputOutputTokenAmount,
      componentsSwapData,
      swapDataInputTokenToEth,
      swapDataEthToInputOutputToken,
    }
  }
}
