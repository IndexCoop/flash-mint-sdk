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
      console.warn(
        'Error - either input or output amount must be set',
        inputToken,
        outputToken,
      )
      return null
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
        console.warn('No Li.Fi estimate')
        return null
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
      console.log('Error getting LiFi swap quote.')
      return null
    }
  }
}
