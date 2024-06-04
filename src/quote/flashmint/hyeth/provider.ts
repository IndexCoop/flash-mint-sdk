import { QuoteProvider, QuoteToken } from 'quote/interfaces'
import {
  getComponentsSwapData,
  getEthToInputOutputTokenSwapData,
} from './swap-data'
import { SwapData } from 'utils'

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
  async getQuote(
    request: FlashMintHyEthQuoteRequest
  ): Promise<FlashMintHyEthQuote | null> {
    const { indexTokenAmount, inputToken, isMinting, outputToken } = request
    const componentsSwapData = getComponentsSwapData(isMinting)
    const swapDataInputTokenToEth = null
    const inputOutputToken = isMinting ? inputToken : outputToken
    const swapDataEthToInputOutputToken =
      getEthToInputOutputTokenSwapData(inputOutputToken)
    // TODO: static call write functions?
    // TODO: define return type
    // TODO: return quote
    return {
      indexTokenAmount,
      // TODO:
      inputOutputTokenAmount: BigInt(1),
      componentsSwapData,
      swapDataInputTokenToEth,
      swapDataEthToInputOutputToken,
    }
  }
}
