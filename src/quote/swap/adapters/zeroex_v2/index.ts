import type {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { getClientV2 } from './client'
import {
  ZeroExV2SwapQuoteProviderError,
  ZeroExV2SwapQuoteProviderErrorType,
} from './errors'
import { convertTo0xSlippage } from './utils'

export class ZeroExV2SwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly apiKey: string) {}

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    const path = this.getPath(request)
    const swapResponse = await getClientV2(path, this.apiKey)
    console.log(swapResponse)
    if (!swapResponse.liquidityAvailable) {
      throw new ZeroExV2SwapQuoteProviderError(
        ZeroExV2SwapQuoteProviderErrorType.insufficientLiquidity,
        'Insufficient liquidity for swap',
      )
    }
    return null
  }

  getPath(request: SwapQuoteRequest): string {
    return new URLSearchParams({
      chainId: request.chainId.toString(),
      buyToken: request.outputToken,
      sellToken: request.inputToken,
      sellAmount: request.inputAmount!,
      taker: request.address!,
      // optional
      slippageBps: convertTo0xSlippage(request.slippage ?? 0.5).toString(),
    }).toString()
  }
}
