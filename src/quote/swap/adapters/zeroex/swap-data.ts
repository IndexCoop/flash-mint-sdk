import { decodePool, extractPoolFees } from 'utils/UniswapPath'
import { Exchange, SwapData } from 'utils'

import {
  ZeroExApiSwapResponse,
  ZeroExApiSwapResponseOrder,
  ZeroExApiSwapResponseOrderSushi,
} from './0x'

// TODO:
// // Used for redeeming (buy debt, sell collateral)
// // Returns collateral amount needed to be sold
// export const getSwapDataCollateralDebt = async (
//   leveragedTokenData: LeveragedTokenData,
//   includedSources: string,
//   slippage: number,
//   chainId: number,
//   zeroExApi: ZeroExApi
// ) => {
//   const result = await getSwapData(
//     {
//       buyToken: leveragedTokenData.debtToken,
//       buyAmount: leveragedTokenData.debtAmount.toString(),
//       sellToken: leveragedTokenData.collateralToken,
//       includedSources,
//     },
//     slippage,
//     chainId,
//     zeroExApi
//   )
//   if (!result || !result.zeroExQuote) return null
//   const { swapData: swapDataDebtCollateral, zeroExQuote } = result
//   const collateralSold = BigNumber.from(zeroExQuote.sellAmount)
//   return { swapDataDebtCollateral, collateralObtainedOrSold: collateralSold }
// }

// // Used for minting (buy collateral, sell debt)
// // Returns collateral amount bought
// export const getSwapDataDebtCollateral = async (
//   leveragedTokenData: LeveragedTokenData,
//   includedSources: string,
//   slippage: number,
//   chainId: number,
//   zeroExApi: ZeroExApi
// ) => {
//   const result = await getSwapData(
//     {
//       buyToken: leveragedTokenData.collateralToken,
//       sellAmount: leveragedTokenData.debtAmount.toString(),
//       sellToken: leveragedTokenData.debtToken,
//       includedSources,
//     },
//     slippage,
//     chainId,
//     zeroExApi
//   )
//   if (!result || !result.zeroExQuote) return null
//   const { swapData: swapDataDebtCollateral, zeroExQuote } = result
//   const collateralObtained = BigNumber.from(zeroExQuote.buyAmount)
//   return {
//     swapDataDebtCollateral,
//     collateralObtainedOrSold: collateralObtained,
//   }
// }

export const getSwapData = async (
  zeroExQuote: ZeroExApiSwapResponse | null
) => {
  if (!zeroExQuote) return null
  return swapDataFrom0xQuote(zeroExQuote)
}

export function getEchangeFrom0xKey(key: string | undefined): Exchange | null {
  switch (key) {
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

export function swapDataFrom0xQuote(
  zeroExQuote: ZeroExApiSwapResponse
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
  order: ZeroExApiSwapResponseOrderSushi
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
