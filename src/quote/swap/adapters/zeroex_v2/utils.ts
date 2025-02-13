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

export function getEchangeFrom0xKey(key: string | undefined): Exchange | null {
  switch (key) {
    case 'Aerodrome':
      return Exchange.Aerodrome
    case 'Balancer_V2':
      return Exchange.BalancerV2
    case 'Curve':
      return Exchange.Curve
    case 'QuickSwap':
      return Exchange.Quickswap
    case 'SushiSwap':
      return Exchange.Sushiswap
    case 'Uniswap_V3':
      return Exchange.UniV3
    default:
      return null
  }
}
