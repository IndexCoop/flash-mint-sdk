import { Exchange } from 'utils'
import type { ZeroExApiV2SwapResponse } from './types'

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
    // For now, no need to exclude any sources.
    default:
      return ''
  }
}
