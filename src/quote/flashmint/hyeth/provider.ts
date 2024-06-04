import { QuoteProvider, QuoteToken } from 'quote/interfaces'
import { getComponentsSwapData } from './swap-data'
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
  // represents `swapDataEthToComponent` for minting
  // and `swapDataComponentToEth` for redeeming
  componentsSwapData: SwapData[]
  // swapDataEthToInputOutputToken
  // mint
  // swapDataEthToInputToken: SwapData
  // redeem
  // swapDataEthToOutputToken: SwapData
}

export class FlashMintHyEthQuoteProvider
  implements QuoteProvider<FlashMintHyEthQuoteRequest, FlashMintHyEthQuote>
{
  async getQuote(
    request: FlashMintHyEthQuoteRequest
  ): Promise<FlashMintHyEthQuote | null> {
    const { indexTokenAmount, isMinting } = request
    const componentsSwapData = getComponentsSwapData(isMinting)
    // TOOD: swap data
    // TODO: static call write functions?
    // TODO: define return type
    // TODO: return quote
    return {
      indexTokenAmount,
      // TODO:
      inputOutputTokenAmount: BigInt(1),
      componentsSwapData,
    }
  }
}
