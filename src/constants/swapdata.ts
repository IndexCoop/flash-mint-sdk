/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Exchange } from 'utils'
import { ETH, InterestCompoundingETHIndex, stETH } from './tokens'

export const noopSwapData: {
  path: string[]
  fees: number[]
  pool: string
  exchange: number
} = {
  path: [],
  fees: [],
  pool: '0x0000000000000000000000000000000000000000',
  exchange: Exchange.None,
}

export const collateralDebtSwapData = {
  [InterestCompoundingETHIndex.symbol]: {
    exchange: Exchange.Curve,
    path: ['0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', ETH.address!],
    fees: [],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  },
}

export const debtCollateralSwapData = {
  [InterestCompoundingETHIndex.symbol]: {
    exchange: Exchange.Curve,
    path: [ETH.address!, '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84'],
    fees: [],
    pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  },
}

export const inputSwapData = {
  [InterestCompoundingETHIndex.symbol]: {
    // icETH only supports ETH as the input token
    [ETH.symbol]: {
      exchange: Exchange.Curve,
      path: [ETH.address!, stETH.address!],
      fees: [],
      pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    },
    [stETH.symbol]: {
      exchange: Exchange.Curve,
      path: [stETH.address!],
      fees: [],
      pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    },
  },
}

export const outputSwapData = {
  [InterestCompoundingETHIndex.symbol]: {
    // icETH only supports ETH as the output token
    [ETH.symbol]: {
      exchange: Exchange.Curve,
      path: ['0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84', ETH.address!],
      fees: [],
      pool: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
    },
  },
}
