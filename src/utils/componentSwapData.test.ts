import { DAI, MoneyMarketIndex, USDC, USDT, WETH } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { LocalhostProvider } from 'tests/utils'
import { wei } from 'utils/numbers'

import {
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from './componentSwapData'
import { Exchange } from './swapData'

const provider = LocalhostProvider
// const zeroExApi = ZeroExApiSwapQuote

const dai = DAI.address!
const usdc = USDC.address!
const usdt = USDT.address!
const weth = WETH.address!

const indexToken: QuoteToken = {
  address: MoneyMarketIndex.address!,
  decimals: 18,
  symbol: MoneyMarketIndex.symbol,
}

describe('getIssuanceComponentSwapData()', () => {
  test('it works', async () => {
    const inputTokenAddress = USDC.address!
    await getIssuanceComponentSwapData(
      indexToken,
      inputTokenAddress,
      wei(1),
      provider
    )
  })
})

describe('getRedemptionComponentSwapData()', () => {
  test('returns correct swap data based on output token (USDC)', async () => {
    const outputToken = usdc
    const zeroAddress = '0x0000000000000000000000000000000000000000'
    const componentSwapData = getRedemptionComponentSwapData(outputToken)
    expect(componentSwapData.length).toBe(3)
    expect(componentSwapData[0].underlyingERC20).toBe(dai)
    expect(componentSwapData[0].buyUnderlyingAmount.isZero()).toBe(true)
    expect(componentSwapData[0].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[0].dexData.fees).toEqual([3000, 3000])
    expect(componentSwapData[0].dexData.path).toEqual([dai, weth, outputToken])
    expect(componentSwapData[0].dexData.pool).toBe(zeroAddress)
    expect(componentSwapData[1].underlyingERC20).toBe(usdc)
    expect(componentSwapData[1].buyUnderlyingAmount.isZero()).toBe(true)
    expect(componentSwapData[1].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[1].dexData.fees).toEqual([3000, 3000])
    expect(componentSwapData[1].dexData.path).toEqual([usdc, weth, outputToken])
    expect(componentSwapData[1].dexData.pool).toBe(zeroAddress)
    expect(componentSwapData[2].underlyingERC20).toBe(usdt)
    expect(componentSwapData[2].buyUnderlyingAmount.isZero()).toBe(true)
    expect(componentSwapData[2].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[2].dexData.fees).toEqual([3000, 3000])
    expect(componentSwapData[2].dexData.path).toEqual([usdt, weth, outputToken])
    expect(componentSwapData[2].dexData.pool).toBe(zeroAddress)
  })

  test('returns correct swap data when output token is WETH', async () => {
    const outputToken = weth
    const zeroAddress = '0x0000000000000000000000000000000000000000'
    const componentSwapData = getRedemptionComponentSwapData(outputToken)
    expect(componentSwapData.length).toBe(3)
    expect(componentSwapData[0].underlyingERC20).toBe(dai)
    expect(componentSwapData[0].buyUnderlyingAmount.isZero()).toBe(true)
    expect(componentSwapData[0].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[0].dexData.fees).toEqual([3000])
    expect(componentSwapData[0].dexData.path).toEqual([dai, outputToken])
    expect(componentSwapData[0].dexData.pool).toBe(zeroAddress)
    expect(componentSwapData[1].underlyingERC20).toBe(usdc)
    expect(componentSwapData[1].buyUnderlyingAmount.isZero()).toBe(true)
    expect(componentSwapData[1].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[1].dexData.fees).toEqual([3000])
    expect(componentSwapData[1].dexData.path).toEqual([usdc, outputToken])
    expect(componentSwapData[1].dexData.pool).toBe(zeroAddress)
    expect(componentSwapData[2].underlyingERC20).toBe(usdt)
    expect(componentSwapData[2].buyUnderlyingAmount.isZero()).toBe(true)
    expect(componentSwapData[2].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[2].dexData.fees).toEqual([3000])
    expect(componentSwapData[2].dexData.path).toEqual([usdt, outputToken])
    expect(componentSwapData[2].dexData.pool).toBe(zeroAddress)
  })
})
