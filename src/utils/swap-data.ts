// The order here has to be exactly the same as in the `DEXAdapter`
// https://github.com/IndexCoop/index-coop-smart-contracts/blob/master/contracts/exchangeIssuance/DEXAdapterV3.sol#L54
export enum Exchange {
  None = 0,
  Quickswap = 1,
  Sushiswap = 2,
  UniV3 = 3,
  Curve = 4,
  BalancerV2 = 5,
  Aerodrome = 6,
  AerodromeSlipstream = 7,
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

// V5 because it belongs to DEXAdapterV5
// https://github.com/IndexCoop/index-coop-smart-contracts/blob/master/contracts/exchangeIssuance/DEXAdapterV5.sol
export interface SwapDataV5 {
  exchange: Exchange
  path: string[]
  fees: number[]
  pool: string
  poolIds: string[]
  tickSpacing: number[]
}
