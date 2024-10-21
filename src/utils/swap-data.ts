// The order here has to be exactly the same as in the `DEXAdapter`
// https://github.com/IndexCoop/index-coop-smart-contracts/blob/master/contracts/exchangeIssuance/DEXAdapterV3.sol#L54
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

export interface SwapDataV3 {
  exchange: Exchange
  path: string[]
  fees: number[]
  pool: string
  poolIds: string[]
}
