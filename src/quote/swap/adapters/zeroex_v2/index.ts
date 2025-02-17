import { getClientV2 } from './client'
import { decode } from './decode'
import { decodeActions } from './decode-actions'
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
import type { Hex } from 'viem'
import type { ZeroExApiV2SwapResponse } from './types'

export class ZeroExV2SwapQuoteProvider implements SwapQuoteProviderV2 {
  constructor(readonly apiKey: string) {}

  async getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null> {
    const { chainId, inputToken, outputToken, slippage } = request
    const path = this.getPath(request)
    const res = await getClientV2(path, this.apiKey)
    console.log(res)
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
    const source = swapResponse.route.fills[0].source
    console.log('///////////')
    console.log('///////////FILLS')
    console.log(swapResponse.route.fills)
    const actions = decode(swapResponse.transaction.data as Hex)
    const swapData = decodeActions(
      actions as Hex[],
      source,
      inputToken,
      outputToken,
    )
    console.log(source, swapData)
    return {
      chainId,
      inputToken,
      outputToken,
      callData: swapResponse.transaction.data,
      inputAmount: swapResponse.sellAmount,
      outputAmount: swapResponse.buyAmount,
      slippage,
      swapData,
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
