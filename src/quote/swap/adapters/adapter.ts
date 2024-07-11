import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'

export class IndexSwapQuoteProvider implements SwapQuoteProvider {
  public async getSwapQuote(
    request: SwapQuoteRequest
  ): Promise<SwapQuote | null> {
    return null
  }
}
