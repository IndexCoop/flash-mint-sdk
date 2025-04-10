import type { Exchange, SwapDataV2 } from 'utils'

export interface SwapPriceQuoteV2 {
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  outputAmount: string
  slippage: number
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

// Currently only used for 0x API v2
export interface SwapPriceRequestV2 {
  chainId: number
  inputToken: string
  outputToken: string
  inputAmount: string
  slippage: number
  sellEntireBalance: boolean
  taker?: string
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
