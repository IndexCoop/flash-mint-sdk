import { getQuote } from 'quote/swap/adapters/lifi/client'

import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
} from 'quote/swap/interfaces'

export class LiFiSwapQuoteProvider implements SwapQuoteProviderV2 {
  constructor(
    readonly apiKey: string,
    readonly integrator: string,
  ) {}

  async getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null> {
    const { integrator } = this
    const {
      chainId,
      inputAmount,
      inputToken,
      outputAmount,
      outputToken,
      slippage,
      taker,
    } = request

    if ((!inputAmount && !outputAmount) || (inputAmount && outputAmount)) {
      throw new Error('Error - either input or output amount must be set')
    }

    try {
      const result = await getQuote(
        {
          fromChain: chainId,
          fromToken: inputToken,
          fromAddress: taker,
          fromAmount: inputAmount,
          toChain: chainId,
          toToken: outputToken,
          toAmount: outputAmount,
          integrator,
          slippage,
        },
        process.env.LIFI_API_KEY!,
      )

      if (!result || !result.transactionRequest) {
        throw new Error('no estimate')
      }

      return {
        chainId,
        inputToken,
        outputToken,
        inputAmount: result.estimate.fromAmount,
        outputAmount: result.estimate.toAmount,
        slippage,
        swapData: {
          swapTarget: result.transactionRequest.to ?? '0x',
          callData: result.transactionRequest.data ?? '0x',
        },
      }
    } catch (error) {
      console.warn('Error getting LiFi swap quote:')
      console.log(error)
      return null
    }
  }
}
