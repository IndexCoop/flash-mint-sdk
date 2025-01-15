import { Exchange, type SwapData } from 'utils'
import { decodePool, extractPoolFees } from 'utils/UniswapPath'

import type {
  ZeroExApiSwapResponse,
  ZeroExApiSwapResponseOrder,
  ZeroExApiSwapResponseOrderAerodrome,
  ZeroExApiSwapResponseOrderSushi,
} from './0x'

export const getSwapData = async (
  zeroExQuote: ZeroExApiSwapResponse | null,
) => {
  if (!zeroExQuote) return null
  return swapDataFrom0xQuote(zeroExQuote)
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

// 0x keys https://github.com/0xProject/protocol/blob/4f32f3174f25858644eae4c3de59c3a6717a757c/packages/asset-swapper/src/utils/market_operation_utils/types.ts#L38
export function get0xEchangeKey(exchange: Exchange): string {
  switch (exchange) {
    case Exchange.Aerodrome:
      return 'Aerodrome'
    case Exchange.Curve:
      return 'Curve'
    case Exchange.Quickswap:
      return 'QuickSwap'
    case Exchange.Sushiswap:
      return 'SushiSwap'
    case Exchange.UniV3:
      return 'Uniswap_V3'
    default:
      return ''
  }
}

export function swapDataFrom0xQuote(
  zeroExQuote: ZeroExApiSwapResponse,
): SwapData | null {
  if (
    zeroExQuote === undefined ||
    zeroExQuote === null ||
    zeroExQuote.orders === undefined ||
    zeroExQuote.orders.length < 1
  )
    return null

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const order: any = zeroExQuote.orders[0]
  /* eslint-enable @typescript-eslint/no-explicit-any */
  const fillData = order.fillData
  const exchange = getEchangeFrom0xKey(order.source)

  if (!fillData || !exchange) return null

  if (exchange === Exchange.Aerodrome) {
    return swapDataFromAerodrome(order)
  }

  // Avoid using Balancer for now - as the contracts don't support it
  // if (exchange === Exchange.BalancerV2) {
  //   return swapDataFromBalancer(order)
  // }

  if (exchange === Exchange.Curve) {
    return swapDataFromCurve(order)
  }

  if (exchange === Exchange.Sushiswap) {
    return swapDataFromSushi(order)
  }

  let fees: number[] = []
  if (exchange === Exchange.UniV3) {
    fees = fillData.path ? extractPoolFees(fillData.path) : [500]
  }

  const path =
    fillData.tokenAddressPath ??
    (fillData.path ? decodePool(fillData.path).tokens : [])

  return {
    exchange,
    path,
    fees,
    pool: '0x0000000000000000000000000000000000000000',
  }
}

function swapDataFromAerodrome(
  order: ZeroExApiSwapResponseOrderAerodrome,
): SwapData | null {
  const fillData = order.fillData
  if (!fillData) return null
  return {
    exchange: Exchange.Aerodrome,
    path: [fillData.routes[0].from, fillData.routes[0].to],
    fees: [],
    pool: fillData.router,
  }
}

function swapDataFromCurve(order: ZeroExApiSwapResponseOrder): SwapData | null {
  const fillData = order.fillData
  if (!fillData) return null
  if (!fillData.pool) return null
  return {
    exchange: Exchange.Curve,
    path: fillData.pool.tokens,
    fees: [],
    pool: fillData.pool.poolAddress,
  }
}

function swapDataFromSushi(
  order: ZeroExApiSwapResponseOrderSushi,
): SwapData | null {
  const fillData = order.fillData
  if (!fillData) return null
  return {
    exchange: Exchange.Sushiswap,
    path: fillData.tokenAddressPath,
    fees: [],
    pool: fillData.router,
  }
}
