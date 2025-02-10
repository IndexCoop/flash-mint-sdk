import type {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'
import { getClientV2 } from './client'
import { convertTo0xSlippage } from './utils'

export class ZeroExV2SwapQuoteProvider implements SwapQuoteProvider {
  constructor(readonly apiKey: string) {}

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    try {
      const path = this.getPath(request)
      const res = await getClientV2(path, this.apiKey)
      console.log(res)
      // const res: ZeroExApiSwapResponse = response.data
    } catch (err: unknown) {
      console.error(err)
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
      slippageBps: convertTo0xSlippage(request.slippage ?? 0.5).toString(),
    }).toString()
  }
}
