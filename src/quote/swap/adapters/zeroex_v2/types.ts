export interface ZeroExApiV2SwapResponse {
  blockNumber: string
  buyAmount: string
  buyToken: string
  fees: {
    integratorFee: {
      amount: string
      token: string
      type: string
    } | null
    zeroExFee: {
      amount: string
      token: string
      type: string
    } | null
    gasFee: {
      amount: string
      token: string
      type: string
    } | null
  }
  issues: {
    allowance: {
      actual: string
      spender: string
    } | null
    balance: {
      token: string
      actual: string
      epxected: string
    } | null
    simulationIncomplete: boolean
    invalidSourcesPassed: string[]
  }
  liquidityAvailable: boolean
  minBuyAmount: string
  route: {
    fills: {
      from: string
      to: string
      source: string
      proportionBps: string
    }[]
    tokens: {
      address: string
      symbol: string
    }[]
  }
  sellAmount: string
  sellToken: string
  tokenMetadata: {
    buyToken: {
      buyTaxBps: string | null
      sellTaxBps: string | null
    }
    sellToken: {
      buyTaxBps: string | null
      sellTaxBps: string | null
    }
  }
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
