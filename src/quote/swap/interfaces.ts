import type { Exchange, SwapData, SwapDataV2 } from 'utils'

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

export interface SwapQuoteV2 {
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  outputAmount: string
  slippage: number
  swapData: SwapDataV2 | null
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

export interface SwapQuoteRequestV2 {
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  slippage: number
  taker: string
  // Optional
  sellEntireBalance?: boolean // might depend on support of provider
  sources?: Exchange[]
}

export interface SwapQuoteProvider {
  getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null>
}

export interface SwapQuoteProviderV2 {
  getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null>
}
