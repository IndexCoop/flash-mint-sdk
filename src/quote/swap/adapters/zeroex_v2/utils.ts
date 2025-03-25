import { Exchange } from 'utils'
import type { ZeroExApiV2SwapResponse } from './types'

/**
 * Converts from 0x fees format (bps) to Uni pool fees
 * @param slippage The slippage to convert to bps where 10000 bps = 100 (fee tier)
 * @returns Uni pool fees tier
 */
export function convertFrom0xFeesToUniPool(bps: bigint): number {
  return Number((bps / BigInt(100)).toString())
}

/**
 * Converts slippage to 0x slippage format (bps)
 * @param slippage The slippage to convert to bps where 0.1 = 0.1%
 * @returns slippage in bps (0x format)
 */
export function convertTo0xSlippage(slippage: number): number {
  if (slippage < 0) return 0
  if (slippage > 100) return 100
  return slippage * 100
}

export function isZeroExApiV2SwapResponse(
  res: any,
): res is ZeroExApiV2SwapResponse {
  return res && typeof res.buyAmount === 'string' && 'liquidityAvailable' in res
}

export const exchangeFrom0xSource: { [key: string]: Exchange } = {
  Aerodrome_V2: Exchange.Aerodrome,
  Aerodrome_V3: Exchange.AerodromeSlipstream,
  Balancer_V2: Exchange.BalancerV2,
  Curve: Exchange.Curve,
  QuickSwap: Exchange.Quickswap,
  SushiSwap: Exchange.Sushiswap,
  Uniswap_V3: Exchange.UniV3,
}

// docs: https://0x.org/docs/api#tag/Sources
export function getExcludedSources(chainId: number) {
  switch (chainId) {
    // TODO: check if neeeded (probably not)
    default:
      return ''
  }
}
