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
    case 1:
      return '0x_RFQ,Ambient,Angle,Balancer_V1,Balancer_V2,Balancer_V3,Bancor_V3,Curve,DODO_V1,DODO_V2,DeFi_Swap,Ekubo,Fluid,Fraxswap_V2,Integral,Lido,Maker_PSM,Maverick,Maverick_V2,Origin,PancakeSwap_V2,PancakeSwap_V3,Polygon_Migration,RingSwap,RocketPool,ShibaSwap,Sky_Migration,Solidly_V3,Spark,Stepn,SushiSwap_V3,Swaap_V2,Synapse,Uniswap_V2,Uniswap_V4,Wrapped_USDM,Yearn,Yearn_V3'
    case 8453:
      // AerodromeV3 only (Slipstream)
      return '0x_RFQ,Aerodrome_V2,AlienBase_Stable,AlienBase_V2,AlienBase_V3,Angle,BaseSwap,BaseX,Clober_V2,DackieSwap_V3,DeltaSwap,Equalizer,Infusion,IziSwap,Kim_V4,Kinetix,Maverick,Maverick_V2,Morphex,Overnight,PancakeSwap_V2,PancakeSwap_V3,RocketSwap,SharkSwap_V2,SoSwap,Solidly_V3,SushiSwap,SushiSwap_V3,SwapBased_V3,Synapse,Synthswap_V2,Synthswap_V3,Thick,Treble,Uniswap_V2,Uniswap_V3,Uniswap_V4,WOOFi_V2,Wrapped_BLT,Wrapped_USDM'
    case 42161:
      return '0x_RFQ,Angle,Balancer_V2,Balancer_V3,Camelot_V2,Camelot_V3,Curve,DODO_V2,Fluid,GMX_V1,Integral,MIMSwap,Maverick_V2,PancakeSwap_V3,Ramses,Ramses_V2,Solidly_V3,SushiSwap,Swapr,Synapse,TraderJoe_V2.1,TraderJoe_V2.2,Uniswap_V2,Uniswap_V4,WOOFi_V2,Wrapped_USDM'
    default:
      return ''
  }
}
