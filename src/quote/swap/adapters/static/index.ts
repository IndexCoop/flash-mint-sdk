import { base } from 'viem/chains'

import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
} from 'quote/swap/interfaces'
import { Exchange, type SwapDataV4 } from 'utils'

export class StaticSwapQuoteProvider implements SwapQuoteProviderV2 {
  async getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null> {
    const { chainId, inputAmount, inputToken, outputToken, slippage } = request

    if (chainId !== base.id) {
      console.warn('Unsupported chainId. Base only for now.')
      return null
    }

    const swapData: SwapDataV4 = {
      exchange: Exchange.AerodromeSlipstream,
      path: [inputToken, outputToken],
      fees: [],
      pool: '',
      poolIds: [],
      tickSpacing: [500],
    }

    return {
      chainId,
      inputToken,
      outputToken,
      callData: '0x', // not used for leverage tokens
      inputAmount,
      outputAmount: '0', // not used for this swap quote provider
      slippage,
      swapData,
    }
  }
}
