import axios from 'axios'

interface ZeroExApiV2SwapResponse {
  blockNumber: string
  buyAmount: string
  buyToken: string
  // fees
  gas: string | null
  gasPrice: string
  // issues
  liquidityAvailable: boolean
  minBuyAmount: string
  // route
  sellAmount: string
  sellToken: string
  // tokenMetadata
  totalNetworkFee: string | null
  zid: string
}

interface ZeroExApiV2SwapResponseNoLiquidity {
  liquidityAvailable: boolean
  zid: string
}

export async function getClientV2(path: string, apiKey: string) {
  const config = {
    headers: {
      '0x-api-key': apiKey,
      '0x-version': 'v2',
    },
  }
  const url = `https://api.0x.org/swap/allowance-holder/quote?${path}`
  const res = await axios.get(url, config)
  return res.data as
    | ZeroExApiV2SwapResponse
    | ZeroExApiV2SwapResponseNoLiquidity
}
