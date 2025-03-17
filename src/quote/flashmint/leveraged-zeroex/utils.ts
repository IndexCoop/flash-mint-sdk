import { BigNumber } from '@ethersproject/bignumber'
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
  // TODO: Add param selling whole contract balance
  const priceParams = new URLSearchParams({
    chainId: chainId.toString(),
    sellToken,
    buyToken,
    sellAmount: sellAmount.toString(),
  })
  if (taker !== undefined) {
    priceParams.append('taker', taker)
  }
  if (sellEntireBalance) {
    priceParams.append('sellEntireBalance', 'true')
  }

  console.log('Fetching data with params:', priceParams.toString())

  const headers = {
    '0x-api-key': process.env.ZEROEX_API_KEY,
    '0x-version': 'v2',
  }

  const endpoint = isQuote ? 'quote' : 'price'
  const url = `https://api.0x.org/swap/allowance-holder/${endpoint}?${priceParams.toString()}`

  const response = await axios.get(url, { headers })
  return response.data
}

/**
 * Fetch ZeroEx data, either from cache or API.
 *
 * @param sellToken - The token to sell.
 * @param buyToken - The token to buy.
 * @param sellAmount - The amount of the sell token.
 * @param blockRange - The max block difference to use cached data.
 * @param flashMintAddress - The taker address.
 * @param isQuote - Whether to fetch a quote or a price.
 * @param blockNumber - block number for which to check the range
 * @returns Cached or fresh response from 0x API.
 */
export async function fetchZeroExData(
  sellToken: string,
  buyToken: string,
  sellAmount: BigNumber,
  blockRange: number,
  flashMintAddress: string,
  isQuote: boolean,
  blockNumber: number,
  chainId: number,
  sellEntireBalance = true,
) {
  // Fetch new data from API
  const priceResponse = await getZeroExResponse(
    chainId,
    sellToken,
    buyToken,
    sellAmount,
    flashMintAddress,
    isQuote,
    sellEntireBalance,
  )
  // console.log("Fetched Data:", priceResponse);

  return priceResponse
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
    console.log({
      buyAmount: buyAmount.toString(),
      sellAmount: sellAmount.toString(),
      targetBuyAmount: targetBuyAmount.toString(),
      maxBuyAmount: maxBuyAmount.toString(),
      minBuyAmount: minBuyAmount.toString(),
    })
    requestNum++
  }
  if (buyAmount.lt(minBuyAmount) || buyAmount.gt(maxBuyAmount)) {
    throw new Error('exceeded max requests')
  }
  return sellAmount
}
