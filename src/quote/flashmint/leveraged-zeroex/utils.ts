import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import type { ZeroExV2SwapQuoteProvider } from 'quote/swap/adapters/zeroex_v2'

export enum SellAmountErrorCode {
  INVALID_TARGET_BUY_AMOUNT = 'INVALID_TARGET_BUY_AMOUNT',
  PRICE_QUOTE_NULL = 'PRICE_QUOTE_NULL',
  BUY_AMOUNT_OUT_OF_RANGE = 'BUY_AMOUNT_OUT_OF_RANGE',
  MAX_REQUESTS_EXCEEDED = 'MAX_REQUESTS_EXCEEDED',
}

export class SellAmountError extends Error {
  public code: SellAmountErrorCode
  constructor(code: SellAmountErrorCode, message: string) {
    super(message)
    this.name = 'SellAmountError'
    this.code = code
  }
}

export async function getSellAmount(
  chainId: number,
  sellToken: string,
  buyToken: string,
  targetBuyAmount: BigNumber,
  minBuyAmount: BigNumber,
  maxBuyAmount: BigNumber,
  startSellAmount: BigNumber,
  maxSellAmount: BigNumber,
  swapQuoteProvider: ZeroExV2SwapQuoteProvider,
  maxRequests = 10,
) {
  if (targetBuyAmount.gt(maxBuyAmount) || targetBuyAmount.lt(minBuyAmount)) {
    throw new SellAmountError(
      SellAmountErrorCode.INVALID_TARGET_BUY_AMOUNT,
      `Target buy amount (${targetBuyAmount.toString()}) is not within the valid range (${minBuyAmount.toString()} - ${maxBuyAmount.toString()}).`,
    )
  }

  if (startSellAmount.gt(maxSellAmount)) {
    console.warn('startSellAmount not in range')
    return null
  }

  const isStEth = isAddressEqual(
    sellToken,
    getTokenByChainAndSymbol(1, 'stETH').address,
  )

  // Get initial price quote
  let response = await swapQuoteProvider.getPriceQuote({
    chainId,
    inputToken: sellToken,
    outputToken: buyToken,
    slippage: 0.5,
    inputAmount: startSellAmount.toString(),
    sellEntireBalance: !isStEth,
  })

  if (!response) {
    throw new SellAmountError(
      SellAmountErrorCode.PRICE_QUOTE_NULL,
      'Initial price quote is null for getSellAmount().',
    )
  }

  let sellAmount = BigNumber.from(response?.inputAmount)
  let buyAmount = BigNumber.from(response?.outputAmount)

  if (sellAmount.gt(maxSellAmount)) {
    console.warn(
        `sellAmount ${sellAmount.toString()} is larger than maxSellAmount (${maxSellAmount.toString()}) - corresponding buy amount: (${buyAmount.toString()})`,
    )
  }

  let requestNum = 0
  while (
    (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) &&
    requestNum < maxRequests
  ) {
    sellAmount = sellAmount.mul(targetBuyAmount).div(buyAmount)
    response = await swapQuoteProvider.getPriceQuote({
      chainId,
      inputToken: sellToken,
      outputToken: buyToken,
      slippage: 0.5,
      inputAmount: sellAmount.toString(),
      sellEntireBalance: !isStEth,
    })

    if (!response) {
      throw new SellAmountError(
        SellAmountErrorCode.PRICE_QUOTE_NULL,
        'Price quote response is null during iteration in getSellAmount().',
      )
    }

    if (sellAmount.gt(maxSellAmount)) {
      console.warn(
        `sellAmount ${sellAmount.toString()} is larger than maxSellAmount (${maxSellAmount.toString()}) - corresponding buy amount: (${buyAmount.toString()})`,
      )
      return null
    }
    requestNum++
  }

  if (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) {
    throw new SellAmountError(
      SellAmountErrorCode.MAX_REQUESTS_EXCEEDED,
      `Exceeded max allowed requests (${maxRequests}).`,
    )
  }

  return sellAmount
}
