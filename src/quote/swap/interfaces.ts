import { Exchange, SwapData } from 'utils'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SwapQuote {
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  outputAmount: string
  callData: string
  slippage: number
  swapData: SwapData | null
}

export interface SwapQuoteRequest {
  chainId: number
  inputToken: string
  outputToken: string
  // Either one of these must be set
  inputAmount?: string
  outputAmount?: string
  // Optional
  address?: string
  slippage?: number
  sources?: Exchange[]
}

export interface SwapQuoteProvider {
  getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null>
}
