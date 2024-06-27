import {
  SwapQuote,
  SwapQuoteProvider,
  SwapQuoteRequest,
} from 'quote/swap/interfaces'

export class UniswapSwapQuoteProvider implements SwapQuoteProvider {
  constructor() {}

  async getSwapQuote(request: SwapQuoteRequest): Promise<SwapQuote | null> {
    const {
      chainId,
      inputAmount,
      inputToken,
      outputAmount,
      outputToken,
      slippage,
    } = request
    if (!inputAmount && !outputAmount) {
      throw new Error('Error - either input or output amount must be set')
    }
    try {
      //   const swapData = getSwapData(result)
      //   return {
      //     chainId,
      //     inputToken,
      //     outputToken,
      //     inputAmount: estimate.fromAmount,
      //     outputAmount: estimate.toAmount,
      //     callData: result.transactionRequest?.data ?? '0x',
      //     slippage: slippage ?? 0,
      //     swapData,
      //   }
      return null
    } catch (error) {
      console.log('Error getting LiFi swap quote:')
      console.log(error)
      return null
    }
  }
}
