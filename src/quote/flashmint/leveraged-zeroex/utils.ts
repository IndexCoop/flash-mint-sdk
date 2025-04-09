import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'
import axios from 'axios'

export async function getZeroExResponse(
  chainId: number,
  sellToken: string,
  buyToken: string,
  sellAmount: BigNumber,
  taker: string | undefined = undefined,
  isQuote = false,
  sellEntireBalance = true,
): Promise<any> {
  if (isQuote && taker === undefined) {
    throw new Error('taker is required when getting actual quote')
  }
  const priceParams = new URLSearchParams({
    chainId: chainId.toString(),
    sellToken,
    buyToken,
    sellAmount: sellAmount.toString(),
  })
  if (taker !== undefined) {
    priceParams.append('taker', taker)
  }
  if (
    sellEntireBalance &&
    !isAddressEqual(sellToken, getTokenByChainAndSymbol(1, 'stETH').address)
  ) {
    priceParams.append('sellEntireBalance', 'true')
  }

  const headers = {
    '0x-api-key': process.env.ZEROEX_API_KEY,
    '0x-version': 'v2',
  }

  const endpoint = isQuote ? 'quote' : 'price'
  const url = `https://api.0x.org/swap/allowance-holder/${endpoint}?${priceParams.toString()}`

  const response = await axios.get(url, { headers })
  return response.data
}

export async function getSellAmount(
  chainId: number,
  sellToken: string,
  buyToken: string,
  targetBuyAmount: BigNumber,
  minBuyAmount: BigNumber,
  maxBuyAmount: BigNumber,
  maxSellAmount: BigNumber,
  maxRequests = 10,
) {
  if (targetBuyAmount.gt(maxBuyAmount) || targetBuyAmount.lt(minBuyAmount)) {
    throw new Error('targetBuyAmount not in range')
  }
  let response = await getZeroExResponse(
    chainId,
    sellToken,
    buyToken,
    maxSellAmount,
  )
  let sellAmount = BigNumber.from(response.sellAmount)
  let buyAmount = BigNumber.from(response.buyAmount)
  if (buyAmount.lt(minBuyAmount)) {
    throw new Error(
      `Buy amount obtained for maxSellAmount (${buyAmount.toString()}) is less than specified minBuyAmount ${minBuyAmount.toString()}`,
    )
  }
  let requestNum = 0
  while (
    (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) &&
    requestNum < maxRequests
  ) {
    sellAmount = sellAmount.mul(targetBuyAmount).div(buyAmount)
    response = await getZeroExResponse(chainId, sellToken, buyToken, sellAmount)
    buyAmount = BigNumber.from(response.buyAmount)
    sellAmount = BigNumber.from(response.sellAmount)
    requestNum++
  }
  if (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) {
    throw new Error('exceeded max requests')
  }
  return sellAmount
}
