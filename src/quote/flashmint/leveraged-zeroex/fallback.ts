import { getSellAmount } from 'quote/flashmint/leveraged-zeroex/utils'

import type { BigNumber } from '@ethersproject/bignumber'
import type { SwapQuoteProviderV2, SwapQuoteRequestV2 } from 'quote/swap'
import type { FlashMintLeveragedZeroExQuoteRequest } from './provider'

export async function getFallbackQuote(
  inputToken: string,
  outputToken: string,
  targetBuyAmount: BigNumber,
  minBuyAmount: BigNumber,
  maxBuyAmount: BigNumber,
  maxSellAmount: BigNumber,
  request: FlashMintLeveragedZeroExQuoteRequest,
  swapQuoteProvider: SwapQuoteProviderV2,
) {
  const { chainId, slippage, taker } = request

  const sellAmount = await getSellAmount(
    chainId,
    inputToken,
    outputToken,
    targetBuyAmount,
    minBuyAmount,
    maxBuyAmount,
    maxSellAmount,
  )

  const quoteRequest: SwapQuoteRequestV2 = {
    chainId,
    inputToken,
    outputToken,
    inputAmount: sellAmount.toString(),
    slippage,
    taker,
  }

  return await swapQuoteProvider.getSwapQuote(quoteRequest)
}
