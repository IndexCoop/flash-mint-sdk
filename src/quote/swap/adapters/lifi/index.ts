import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'

export class LiFiSwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly apiKey: string) {}

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    // TODO: based on input/output amount set, take different route
    return null
  }
}
