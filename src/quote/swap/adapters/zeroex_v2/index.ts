import { getClientV2 } from './client'
import {
  ZeroExV2SwapQuoteProviderError,
  ZeroExV2SwapQuoteProviderErrorType,
} from './errors'
import {
  convertTo0xSlippage,
  getExcludedSources,
  isZeroExApiV2SwapResponse,
} from './utils'

import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
} from 'quote/swap/interfaces'
import type { ZeroExApiV2SwapResponse } from './types'

export class ZeroExV2SwapQuoteProvider implements SwapQuoteProviderV2 {
  constructor(readonly apiKey: string) {}

  async getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null> {
    const { chainId, inputToken, outputToken, slippage } = request
    const path = this.getPath(request)
    try {
      const res = await getClientV2(path, this.apiKey)

      if (!res.liquidityAvailable) {
        throw new ZeroExV2SwapQuoteProviderError(
          ZeroExV2SwapQuoteProviderErrorType.insufficientLiquidity,
          'Insufficient liquidity for swap',
        )
      }

      if (!isZeroExApiV2SwapResponse(res)) {
        throw new Error('Invalid response format from ZeroEx API')
      }

      const swapResponse: ZeroExApiV2SwapResponse = res

      return {
        chainId,
        inputToken,
        outputToken,
        inputAmount: swapResponse.sellAmount,
        outputAmount: swapResponse.buyAmount,
        slippage,
        swapData: {
          swapTarget: swapResponse.transaction.to,
          callData: swapResponse.transaction.data,
        },
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }

  getPath(request: SwapQuoteRequestV2): string {
    return new URLSearchParams({
      chainId: request.chainId.toString(),
      buyToken: request.outputToken,
      sellToken: request.inputToken,
      sellAmount: request.inputAmount,
      taker: request.taker,
      slippageBps: convertTo0xSlippage(request.slippage).toString(),
      excludedSources: getExcludedSources(request.chainId),
    }).toString()
  }
}
