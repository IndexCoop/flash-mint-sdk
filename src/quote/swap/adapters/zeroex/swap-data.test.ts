import { BigNumber } from '@ethersproject/bignumber'

import { Exchange } from 'utils'

import {
  getEchangeFrom0xKey,
  getSwapData,
  swapDataFrom0xQuote,
} from './swap-data'

describe('getEchangeFrom0xKey()', () => {
  test('returns null if 0x key undefined', async () => {
    const exchange = getEchangeFrom0xKey(undefined)
    expect(exchange).toBeNull()
  })

  test('returns correct exchanges for 0x keys', async () => {
    const balancer = getEchangeFrom0xKey('Balancer_V2')
    const curve = getEchangeFrom0xKey('Curve')
    const quickswap = getEchangeFrom0xKey('QuickSwap')
    const sushi = getEchangeFrom0xKey('SushiSwap')
    const uniswap = getEchangeFrom0xKey('Uniswap_V3')
    expect(
      Object.keys(Exchange).filter((key) => Number.isNaN(Number(key))).length,
    ).toEqual(6)
    expect(balancer).toEqual(Exchange.BalancerV2)
    expect(curve).toEqual(Exchange.Curve)
    expect(quickswap).toEqual(Exchange.Quickswap)
    expect(sushi).toEqual(Exchange.Sushiswap)
    expect(uniswap).toEqual(Exchange.UniV3)
  })
})

describe('getSwapData()', () => {
  test('fails with null', async () => {
    const swapData = await getSwapData(null)
    expect(swapData).toBeNull()
  })
})

describe('swapDataFrom0xQuote()', () => {
  test('should return null if no data present', async () => {
    const zeroExQuote = undefined
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const swapData = swapDataFrom0xQuote(zeroExQuote!)
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    expect(swapData).toBeNull()
  })

  test('should return null if no orders are present', async () => {
    const zeroExQuote = zeroExQuoteMock
    const swapData = swapDataFrom0xQuote(zeroExQuote)
    expect(swapData).toBeNull()
    zeroExQuote.orders = []
    const swapData2 = swapDataFrom0xQuote(zeroExQuote)
    expect(swapData2).toBeNull()
  })

  test('should return correct exchange - UniV3', async () => {
    const zeroExQuote = zeroExQuoteMock
    zeroExQuote.orders = [
      {
        makerToken: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        takerToken: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        makerAmount: '480610511680519',
        takerAmount: '967781',
        fillData: {
          router: '0xe592427a0aece92de3edee1f18e0157c05861564',
          tokenAddressPath: [
            '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
            '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
          ],
          uniswapPath:
            '0x2791bca1f2de4661ed88a30c99a7a9449aa841740001f47ceb23fd6bc0add59e62ac25578270cff1b9f619',
          gasUsed: 60155,
        },
        source: 'Uniswap_V3',
        sourcePathId:
          '0xf66e2b26767633a5c3bba415dc60abb680c0bf5666535550cc093e18a2a8e33a',
        type: 0,
      },
    ]
    const swapData = swapDataFrom0xQuote(zeroExQuote)
    expect(swapData).not.toBeNull()
    expect(swapData?.exchange).toEqual(Exchange.UniV3)
  })

  test('should return correct fees for UniV3', () => {
    const zeroExQuote = zeroExQuoteMock
    zeroExQuote.orders = [
      {
        makerToken: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        takerToken: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        makerAmount: '480610511680519',
        takerAmount: '967781',
        fillData: {
          router: '0xe592427a0aece92de3edee1f18e0157c05861564',
          tokenAddressPath: [
            '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
            '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
          ],
          uniswapPath:
            '0x2791bca1f2de4661ed88a30c99a7a9449aa841740001f47ceb23fd6bc0add59e62ac25578270cff1b9f619',
          gasUsed: 60155,
        },
        source: 'Uniswap_V3',
        sourcePathId:
          '0xf66e2b26767633a5c3bba415dc60abb680c0bf5666535550cc093e18a2a8e33a',
        type: 0,
      },
    ]
    const swapData = swapDataFrom0xQuote(zeroExQuote)
    expect(swapData).not.toBeNull()
    expect(swapData?.exchange).toEqual(Exchange.UniV3)
    expect(swapData?.path).toEqual(
      zeroExQuote.orders[0].fillData.tokenAddressPath,
    )
    expect(swapData?.pool).toEqual('0x0000000000000000000000000000000000000000')
    expect(swapData?.fees).toEqual([500])
  })
})

/* eslint-disable @typescript-eslint/no-explicit-any */
const zeroExQuoteMock: any = {
  chainId: '1',
  data: '',
  estimatedPriceImpact: '',
  price: '',
  guaranteedPrice: '',
  buyTokenAddress: '',
  sellTokenAddress: '',
  buyAmount: '',
  sellAmount: '',
  to: '',
  from: '',
  sources: [],
  displayBuyAmount: 0,
  displaySellAmount: 0,
  minOutput: BigNumber.from(0),
  maxInput: BigNumber.from(0),
  gas: undefined,
  gasPrice: '',
  formattedSources: '',
  buyTokenCost: '',
  sellTokenCost: '',
  value: '',
}
