import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import type { ZeroExV2SwapQuoteProvider } from 'quote/swap/adapters/zeroex_v2'

export async function getSellAmount(
  chainId: number,
  sellToken: string,
  buyToken: string,
  targetBuyAmount: BigNumber,
  minBuyAmount: BigNumber,
  maxBuyAmount: BigNumber,
  maxSellAmount: BigNumber,
  swapQuoteProvider: ZeroExV2SwapQuoteProvider,
  maxRequests = 10,
) {
  if (targetBuyAmount.gt(maxBuyAmount) || targetBuyAmount.lt(minBuyAmount)) {
    console.warn('targetBuyAmount not in range')
    return null
  }

  const isStEth = isAddressEqual(
    sellToken,
    getTokenByChainAndSymbol(1, 'stETH').address,
  )
  let response = await swapQuoteProvider.getPriceQuote({
    chainId,
    inputToken: sellToken,
    outputToken: buyToken,
    slippage: 0.5,
    inputAmount: maxSellAmount.toString(),
    sellEntireBalance: !isStEth,
  })
  if (!response) {
    console.warn('Initial price response is null for getSellAmount()')
    return null
  }

  let sellAmount = BigNumber.from(response?.inputAmount)
  let buyAmount = BigNumber.from(response?.outputAmount)
  if (buyAmount.lt(minBuyAmount)) {
    console.warn(
      `Buy amount obtained for maxSellAmount (${buyAmount.toString()}) is less than specified minBuyAmount ${minBuyAmount.toString()}`,
    )
    return null
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
    if (response) {
      buyAmount = BigNumber.from(response.outputAmount)
      sellAmount = BigNumber.from(response.inputAmount)
    } else {
      console.warn('Response is null for getSellAmount()')
      return null
    }
    requestNum++
  }
  if (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) {
    console.warn('Exceeded max requests')
    return null
  }
  return sellAmount
}
