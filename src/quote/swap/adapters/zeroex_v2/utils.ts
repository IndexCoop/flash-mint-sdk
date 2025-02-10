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
