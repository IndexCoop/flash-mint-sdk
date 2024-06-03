// The order here has to be exactly the same as in the `DEXAdapter``
// https://github.com/IndexCoop/index-coop-smart-contracts/blob/317dfb677e9738fc990cf69d198358065e8cb595/contracts/exchangeIssuance/DEXAdapter.sol#L53
export enum Exchange {
  None,
  Quickswap,
  Sushiswap,
  UniV3,
  Curve,
  BalancerV2,
}

export interface SwapData {
  exchange: Exchange
  path: string[]
  fees: number[]
  pool: string
}
