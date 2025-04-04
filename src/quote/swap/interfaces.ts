import type { Exchange, SwapDataV2 } from 'utils'

export interface SwapQuoteV2 {
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  outputAmount: string
  slippage: number
  swapData: SwapDataV2 | null
}

export interface SwapQuoteRequestV2 {
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount?: string
  outputAmount?: string // note that not all providers may support this
  slippage: number
  taker: string
  // Optional
  sellEntireBalance?: boolean // might depend on support of provider
  sources?: Exchange[]
}

export interface SwapQuoteProviderV2 {
  getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null>
}
