import { getSellAmount } from 'quote/flashmint/leveraged-zeroex/utils'

import type { BigNumber } from '@ethersproject/bignumber'
import type { SellAmountError } from 'quote/flashmint/leveraged-zeroex/utils'
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

  try {
    const sellAmount = await getSellAmount(
      chainId,
      inputToken,
      outputToken,
      targetBuyAmount,
      minBuyAmount,
      maxBuyAmount,
      maxSellAmount,
      swapQuoteProvider,
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
  } catch (error) {
    console.warn(
      'Can not determine fallback quote:',
      (error as SellAmountError).code,
      (error as SellAmountError).message,
    )
    return null
  }
}
