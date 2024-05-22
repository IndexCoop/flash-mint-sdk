import { ZeroExApiSwapResponse } from 'utils'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface SwapQuote extends ZeroExApiSwapResponse {}
export interface SwapQuoteRequest {
  chainId: number
  inputToken: string
  outputToken: string
  // Either one of these must be set
  inputAmount?: string
  outputAmount?: string
  // Optional
  includedSources?: string // TODO:
  slippage?: number
}

export interface SwapQuoteProvider {
  getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null>
}
