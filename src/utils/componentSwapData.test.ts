import { DAI, MoneyMarketIndex, USDC, USDT, WETH } from 'constants/tokens'
import { LocalhostProvider } from 'tests/utils'
import { wei } from 'utils/numbers'

import {
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from './componentSwapData'
import { Exchange } from './swapData'

const provider = LocalhostProvider

const dai = DAI.address!
const usdc = USDC.address!
const usdt = USDT.address!
const weth = WETH.address!
const zeroAddress = '0x0000000000000000000000000000000000000000'

describe('getIssuanceComponentSwapData()', () => {
  test('returns correct swap data based on input token (USDC)', async () => {
    const inputTokenAddress = USDC.address!
    const componentSwapData = await getIssuanceComponentSwapData(
      MoneyMarketIndex.symbol,
      MoneyMarketIndex.address!,
      inputTokenAddress,
      wei(1),
      provider
    )
    expect(componentSwapData.length).toBe(3)
    expect(componentSwapData[0].underlyingERC20).toBe(dai)
    expect(componentSwapData[1].underlyingERC20).toBe(usdc)
    expect(componentSwapData[2].underlyingERC20).toBe(usdt)
    expect(componentSwapData[0].buyUnderlyingAmount.gt(0)).toBe(true)
    expect(componentSwapData[1].buyUnderlyingAmount.gt(0)).toBe(true)
    expect(componentSwapData[2].buyUnderlyingAmount.gt(0)).toBe(true)
    expect(componentSwapData[0].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[1].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[2].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[0].dexData.fees).toEqual([3000, 3000])
    expect(componentSwapData[1].dexData.fees).toEqual([3000, 3000])
    expect(componentSwapData[2].dexData.fees).toEqual([3000, 3000])
  })

  test('returns correct swap data based when input token is WETH', async () => {
    const inputToken = WETH.address!
    const componentSwapData = await getIssuanceComponentSwapData(
      MoneyMarketIndex.symbol,
      MoneyMarketIndex.address!,
      inputToken,
      wei(1),
      provider
    )
    expect(componentSwapData.length).toBe(3)
    expect(componentSwapData[0].underlyingERC20).toBe(dai)
    expect(componentSwapData[1].underlyingERC20).toBe(usdc)
    expect(componentSwapData[2].underlyingERC20).toBe(usdt)
    expect(componentSwapData[0].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[1].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[2].dexData.exchange).toBe(Exchange.UniV3)
    expect(componentSwapData[0].dexData.fees).toEqual([3000])
    expect(componentSwapData[1].dexData.fees).toEqual([3000])
    expect(componentSwapData[2].dexData.fees).toEqual([3000])
    expect(componentSwapData[0].dexData.path).toEqual([inputToken, dai])
    expect(componentSwapData[1].dexData.path).toEqual([inputToken, usdc])
    expect(componentSwapData[2].dexData.path).toEqual([inputToken, usdt])
    expect(componentSwapData[0].dexData.pool).toBe(zeroAddress)
    expect(componentSwapData[1].dexData.pool).toBe(zeroAddress)
    expect(componentSwapData[2].dexData.pool).toBe(zeroAddress)
  })
})

describe('getRedemptionComponentSwapData()', () => {
  test('returns correct swap data based on output token (USDC)', async () => {
    const outputToken = usdc
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
