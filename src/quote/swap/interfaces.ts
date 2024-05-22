interface SwapQuote {}
interface SwapQuoteRequest {}

export interface SwapQuoteProvider {
  getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null>
}
