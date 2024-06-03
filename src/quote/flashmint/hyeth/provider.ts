import { QuoteProvider, QuoteToken } from 'quote/interfaces'

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
  // swapDataDebtCollateral: SwapData
  // swapDataPaymentToken: SwapData
}

export class FlashMintHyEthQuoteProvider
  implements QuoteProvider<FlashMintHyEthQuoteRequest, FlashMintHyEthQuote>
{
  async getQuote(
    request: FlashMintHyEthQuoteRequest
  ): Promise<FlashMintHyEthQuote | null> {
    return null
  }
}
