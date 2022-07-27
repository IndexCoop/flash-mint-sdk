import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTokenData } from '../flashMint/leveraged'
import { ZeroExApi } from './0x'
import { extractPoolFees } from './UniswapPath'

export enum Exchange {
  None,
  Quickswap,
  Sushiswap,
  UniV3,
  Curve,
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
  if (!result) return null
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
  if (!result) return null
  const { swapData: swapDataDebtCollateral, zeroExQuote } = result
  const collateralObtained = BigNumber.from(zeroExQuote.buyAmount)
  return {
    swapDataDebtCollateral,
    collateralObtainedOrSold: collateralObtained,
  }
}

export const getSwapData = async (
  params: any,
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
  const swapData = swapDataFrom0xQuote(zeroExQuote)
  if (swapData) return { swapData, zeroExQuote }
  return null
}

export function getEchangeFrom0xKey(key: string | undefined): Exchange | null {
  switch (key) {
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

export function swapDataFrom0xQuote(zeroExQuote: any): SwapData | null {
  if (
    zeroExQuote === undefined ||
    zeroExQuote === null ||
    zeroExQuote.orders === undefined ||
    zeroExQuote.orders.length < 1
  )
    return null

  const order = zeroExQuote.orders[0]
  const fillData = order.fillData
  const exchange = getEchangeFrom0xKey(order.source)

  if (!fillData || !exchange) return null

  if (exchange === Exchange.Curve) {
    return swapDataFromCurve(order)
  }

  let fees: number[] = []
  if (exchange === Exchange.UniV3) {
    fees = fillData.uniswapPath ? extractPoolFees(fillData.uniswapPath) : [500]
  }

  return {
    exchange,
    path: fillData.tokenAddressPath,
    fees,
    pool: '0x0000000000000000000000000000000000000000',
  }
}

function swapDataFromCurve(order: any): SwapData | null {
  const fillData = order.fillData
  if (!fillData) return null
  return {
    exchange: Exchange.Curve,
    path: fillData.pool.tokens,
    fees: [],
    pool: fillData.pool.poolAddress,
  }
}
