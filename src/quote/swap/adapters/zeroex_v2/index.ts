import type {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'

export class ZeroExV2SwapQuoteProvider implements SwapQuoteProvider {
  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    console.log(request)
    return null
  }
}
