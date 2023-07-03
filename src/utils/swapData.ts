import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTokenData } from '../quote/leveraged'
import {
  ZeroExApi,
  ZeroExApiSwapResponse,
  ZeroExApiSwapResponseOrder,
  ZeroExApiSwapResponseOrderBalancer,
} from './0x'
import { decodePool, extractPoolFees } from './UniswapPath'

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

// Used for redeeming (buy debt, sell collateral)
// Returns collateral amount needed to be sold
export const getSwapDataCollateralDebt = async (
  leveragedTokenData: LeveragedTokenData,
  includedSources: string,
  slippage: number,
  chainId: number,
  zeroExApi: ZeroExApi
) => {
  const result = await getSwapData(
    {
      buyToken: leveragedTokenData.debtToken,
      buyAmount: leveragedTokenData.debtAmount.toString(),
      sellToken: leveragedTokenData.collateralToken,
      includedSources,
    },
    slippage,
    chainId,
    zeroExApi
  )
  if (!result || !result.zeroExQuote) return null
  const { swapData: swapDataDebtCollateral, zeroExQuote } = result
  const collateralSold = BigNumber.from(zeroExQuote.sellAmount)
  return { swapDataDebtCollateral, collateralObtainedOrSold: collateralSold }
}

// Used for minting (buy collateral, sell debt)
// Returns collateral amount bought
export const getSwapDataDebtCollateral = async (
  leveragedTokenData: LeveragedTokenData,
  includedSources: string,
  slippage: number,
  chainId: number,
  zeroExApi: ZeroExApi
) => {
  const result = await getSwapData(
    {
      buyToken: leveragedTokenData.collateralToken,
      sellAmount: leveragedTokenData.debtAmount.toString(),
      sellToken: leveragedTokenData.debtToken,
      includedSources,
    },
    slippage,
    chainId,
    zeroExApi
  )
  if (!result || !result.zeroExQuote) return null
  const { swapData: swapDataDebtCollateral, zeroExQuote } = result
  const collateralObtained = BigNumber.from(zeroExQuote.buyAmount)
  return {
    swapDataDebtCollateral,
    collateralObtainedOrSold: collateralObtained,
  }
}

interface SwapDataParams {
  buyToken: string
  buyAmount?: string
  sellAmount?: string
  sellToken: string
  includedSources?: string
}

export const getSwapData = async (
  params: SwapDataParams,
  slippage: number,
  chainId: number,
  zeroExApi: ZeroExApi
) => {
  // TODO: error handling (for INSUFFICIENT_ASSET_LIQUIDITY)
  const zeroExQuote = await zeroExApi.getSwapQuote(
    {
      ...params,
      slippagePercentage: slippage / 100,
    },
    chainId
  )
  if (!zeroExQuote) return null
  const swapData = swapDataFrom0xQuote(zeroExQuote)
  if (swapData) return { swapData, zeroExQuote }
  return null
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

  if (exchange === Exchange.BalancerV2) {
    return swapDataFromBalancer(order)
  }

  if (exchange === Exchange.Curve) {
    return swapDataFromCurve(order)
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

function swapDataFromBalancer(
  order: ZeroExApiSwapResponseOrderBalancer
): SwapData | null {
  const fillData = order.fillData
  if (!fillData) return null
  return {
    exchange: Exchange.BalancerV2,
    path: fillData.assets,
    fees: [],
    // FIXME: check
    pool: fillData.swapSteps.poolId,
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
