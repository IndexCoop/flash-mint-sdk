import axios from 'axios'

import type {
  SwapQuoteProviderV2,
  SwapQuoteRequestV2,
  SwapQuoteV2,
} from 'quote/swap/interfaces'

type UniswapQuoteApiResponse = {
  methodParameters: {
    to: string
    calldata: string
    value: string
  }
  amountIn: string
}

export class UniswapSwapQuoteProvider implements SwapQuoteProviderV2 {
  constructor(
    readonly url: string,
    readonly apiKey: string,
  ) {}

  async getSwapQuote(request: SwapQuoteRequestV2): Promise<SwapQuoteV2 | null> {
    const { chainId, inputToken, outputAmount, outputToken, slippage, taker } =
      request

    if (!outputAmount) {
      console.warn(
        'Error - output amount must be set.',
        inputToken,
        outputToken,
      )
      return null
    }

    const requestBody = {
      inputTokenAddress: inputToken,
      outputTokenAddress: outputToken,
      recipient: taker,
      amount: outputAmount,
      chainId,
    }

    try {
      const config = {
        headers: {
          // TODO:
          'x-api-key': this.apiKey,
        },
      }

      console.log(this.url)
      const res: UniswapQuoteApiResponse = await axios.post(
        this.url,
        requestBody,
        config,
      )
      console.log(res)

      if (!res) {
        console.warn('No Li.Fi estimate')
        return null
      }

      return {
        chainId,
        inputToken,
        outputToken,
        inputAmount: res.amountIn,
        outputAmount,
        // TODO:
        slippage,
        swapData: {
          swapTarget: res.methodParameters.to,
          callData: res.methodParameters.calldata,
        },
      }
    } catch (error) {
      console.warn('Error getting LiFi swap quote.')
      return null
    }
  }
}
