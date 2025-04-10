import axios from 'axios'

import type {
  ZeroExApiV2SwapResponse,
  ZeroExApiV2SwapResponseNoLiquidity,
} from './types'

export async function getClientV2(
  path: string,
  apiKey: string,
  isPriceQuote = false,
) {
  const config = {
    headers: {
      '0x-api-key': apiKey,
      '0x-version': 'v2',
    },
  }
  const endpoint = isPriceQuote ? 'price' : 'quote'
  const url = `https://api.0x.org/swap/allowance-holder/${endpoint}?${path}`
  const res = await axios.get(url, config)
  return res.data as
    | ZeroExApiV2SwapResponse
    | ZeroExApiV2SwapResponseNoLiquidity
}
