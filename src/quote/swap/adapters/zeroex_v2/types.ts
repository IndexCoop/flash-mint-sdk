export interface ZeroExApiV2SwapResponse {
  blockNumber: string
  buyAmount: string
  buyToken: string
  // fees
  gas: string | null
  gasPrice: string
  // issues
  liquidityAvailable: boolean
  minBuyAmount: string
  route: {
    fills: {
      from: string
      to: string
      source: string
      proportionBps: string
    }
    tokens: {
      address: string
      symbol: string
    }[]
  }
  sellAmount: string
  sellToken: string
  // tokenMetadata
  totalNetworkFee: string | null
  transaction: {
    to: string
    data: string
    gas: string
    gasPrice: string
    value: string
  }
  zid: string
}

export interface ZeroExApiV2SwapResponseNoLiquidity {
  liquidityAvailable: boolean
  zid: string
}
