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
    const inputToken = USDC.address!
    const componentSwapData = await getIssuanceComponentSwapData(
      MoneyMarketIndex.symbol,
      MoneyMarketIndex.address!,
      inputToken,
      wei(1),
      provider
    )
    expect(componentSwapData.length).toBe(6)
    expect(componentSwapData[0].underlyingERC20).toBe(usdc)
    expect(componentSwapData[1].underlyingERC20).toBe(usdt)
    expect(componentSwapData[2].underlyingERC20).toBe(usdt)
    expect(componentSwapData[3].underlyingERC20).toBe(dai)
    expect(componentSwapData[4].underlyingERC20).toBe(dai)
    expect(componentSwapData[5].underlyingERC20).toBe(usdc)
    expect(componentSwapData[0].dexData.path).toEqual([inputToken, weth, usdc])
    expect(componentSwapData[1].dexData.path).toEqual([inputToken, weth, usdt])
    expect(componentSwapData[2].dexData.path).toEqual([inputToken, weth, usdt])
    expect(componentSwapData[3].dexData.path).toEqual([inputToken, weth, dai])
    expect(componentSwapData[4].dexData.path).toEqual([inputToken, weth, dai])
    expect(componentSwapData[5].dexData.path).toEqual([inputToken, weth, usdc])
    componentSwapData.forEach((swapData) => {
      expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
      expect(swapData.dexData.exchange).toBe(Exchange.UniV3)
      expect(swapData.dexData.fees).toEqual([3000, 3000])
      expect(swapData.dexData.pool).toBe(zeroAddress)
    })
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
    expect(componentSwapData.length).toBe(6)
    expect(componentSwapData[0].underlyingERC20).toBe(usdc)
    expect(componentSwapData[1].underlyingERC20).toBe(usdt)
    expect(componentSwapData[2].underlyingERC20).toBe(usdt)
    expect(componentSwapData[3].underlyingERC20).toBe(dai)
    expect(componentSwapData[4].underlyingERC20).toBe(dai)
    expect(componentSwapData[5].underlyingERC20).toBe(usdc)
    expect(componentSwapData[0].dexData.path).toEqual([weth, usdc])
    expect(componentSwapData[1].dexData.path).toEqual([weth, usdt])
    expect(componentSwapData[2].dexData.path).toEqual([weth, usdt])
    expect(componentSwapData[3].dexData.path).toEqual([weth, dai])
    expect(componentSwapData[4].dexData.path).toEqual([weth, dai])
    expect(componentSwapData[5].dexData.path).toEqual([weth, usdc])
    componentSwapData.forEach((swapData) => {
      expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
      expect(swapData.dexData.exchange).toBe(Exchange.UniV3)
      expect(swapData.dexData.fees).toEqual([3000])
      expect(swapData.dexData.pool).toBe(zeroAddress)
    })
  })
})

describe('getRedemptionComponentSwapData()', () => {
  test('returns correct swap data based on output token (USDC)', async () => {
    const outputToken = usdc
    const componentSwapData = await getRedemptionComponentSwapData(
      MoneyMarketIndex.symbol,
      MoneyMarketIndex.address!,
      outputToken,
      wei(1),
      provider
    )
    expect(componentSwapData.length).toBe(6)
    expect(componentSwapData[0].underlyingERC20).toBe(usdc)
    expect(componentSwapData[1].underlyingERC20).toBe(usdt)
    expect(componentSwapData[2].underlyingERC20).toBe(usdt)
    expect(componentSwapData[3].underlyingERC20).toBe(dai)
    expect(componentSwapData[4].underlyingERC20).toBe(dai)
    expect(componentSwapData[5].underlyingERC20).toBe(usdc)
    expect(componentSwapData[0].dexData.path).toEqual([usdc, weth, usdc])
    expect(componentSwapData[1].dexData.path).toEqual([usdt, weth, usdc])
    expect(componentSwapData[2].dexData.path).toEqual([usdt, weth, usdc])
    expect(componentSwapData[3].dexData.path).toEqual([dai, weth, usdc])
    expect(componentSwapData[4].dexData.path).toEqual([dai, weth, usdc])
    expect(componentSwapData[5].dexData.path).toEqual([usdc, weth, usdc])
    componentSwapData.forEach((swapData) => {
      expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
      expect(swapData.dexData.exchange).toBe(Exchange.UniV3)
      expect(swapData.dexData.fees).toEqual([3000, 3000])
      expect(swapData.dexData.pool).toBe(zeroAddress)
    })
  })

  test('returns correct swap data when output token is WETH', async () => {
    const outputToken = weth
    const componentSwapData = await getRedemptionComponentSwapData(
      MoneyMarketIndex.symbol,
      MoneyMarketIndex.address!,
      outputToken,
      wei(1),
      provider
    )
    expect(componentSwapData.length).toBe(6)
    expect(componentSwapData[0].underlyingERC20).toBe(usdc)
    expect(componentSwapData[1].underlyingERC20).toBe(usdt)
    expect(componentSwapData[2].underlyingERC20).toBe(usdt)
    expect(componentSwapData[3].underlyingERC20).toBe(dai)
    expect(componentSwapData[4].underlyingERC20).toBe(dai)
    expect(componentSwapData[5].underlyingERC20).toBe(usdc)
    expect(componentSwapData[0].dexData.path).toEqual([usdc, weth])
    expect(componentSwapData[1].dexData.path).toEqual([usdt, weth])
    expect(componentSwapData[2].dexData.path).toEqual([usdt, weth])
    expect(componentSwapData[3].dexData.path).toEqual([dai, weth])
    expect(componentSwapData[4].dexData.path).toEqual([dai, weth])
    expect(componentSwapData[5].dexData.path).toEqual([usdc, weth])
    componentSwapData.forEach((swapData) => {
      expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
      expect(swapData.dexData.exchange).toBe(Exchange.UniV3)
      expect(swapData.dexData.fees).toEqual([3000])
      expect(swapData.dexData.pool).toBe(zeroAddress)
    })
  })
})
