import { getSellAmount } from 'quote/flashmint/leveraged-zeroex/utils'

import type { BigNumber } from '@ethersproject/bignumber'
import type { SwapQuoteRequestV2, ZeroExV2SwapQuoteProvider } from 'quote/swap'
import type { FlashMintLeveragedZeroExQuoteRequest } from './provider'

export async function getFallbackQuote(
  inputToken: string,
  outputToken: string,
  targetBuyAmount: BigNumber,
  minBuyAmount: BigNumber,
  maxBuyAmount: BigNumber,
  maxSellAmount: BigNumber,
  request: FlashMintLeveragedZeroExQuoteRequest,
  swapQuoteProvider: ZeroExV2SwapQuoteProvider,
) {
  const { chainId, slippage, taker } = request

  // TODO: Use a better startSellAmount to make the search shorter / more precise
  // Ideas:
  // - Cache data on the backend regarding current exchange rates between token pairs (for example from past requests)
  // - Use startSellAmount = targetBuyAmount * cachedExchangeRate
  const startSellAmount = maxSellAmount
  const sellAmount = await getSellAmount(
    chainId,
    inputToken,
    outputToken,
    targetBuyAmount,
    minBuyAmount,
    maxBuyAmount,
    startSellAmount,
    maxSellAmount,
    swapQuoteProvider,
  )

  if (!sellAmount) {
    console.warn('Can not determine sell amount for fallback quote')
    return null
  }

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
