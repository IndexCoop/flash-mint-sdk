/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { DAI, MoneyMarketIndexToken, USDC, USDT, WETH } from 'constants/tokens'
import { LocalhostProvider, ZeroExApiSwapQuote } from 'tests/utils'
import { wei } from 'utils/numbers'

import {
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from './componentSwapData'
import { Exchange } from './swapData'

const provider = LocalhostProvider
const zeroExApi = ZeroExApiSwapQuote

const dai = DAI.address!.toLowerCase()
const usdc = USDC.address!.toLowerCase()
const usdt = USDT.address!.toLowerCase()
const weth = WETH.address!.toLowerCase()
const zeroAddress = '0x0000000000000000000000000000000000000000'

describe.skip('getIssuanceComponentSwapData()', () => {
  test('returns correct swap data based on input token (USDC)', async () => {
    const inputToken = usdc
    const componentSwapData = await getIssuanceComponentSwapData(
      MoneyMarketIndexToken.symbol,
      MoneyMarketIndexToken.address!,
      inputToken,
      wei(1),
      provider,
      zeroExApi
    )
    expect(componentSwapData.length).toBe(6)
    expect(componentSwapData[0].underlyingERC20.toLowerCase()).toBe(usdc)
    expect(componentSwapData[1].underlyingERC20.toLowerCase()).toBe(dai)
    expect(componentSwapData[2].underlyingERC20.toLowerCase()).toBe(usdt)
    expect(componentSwapData[3].underlyingERC20.toLowerCase()).toBe(usdt)
    expect(componentSwapData[4].underlyingERC20.toLowerCase()).toBe(dai)
    expect(componentSwapData[5].underlyingERC20.toLowerCase()).toBe(usdc)
    // Should be empty as input token is equal to output token
    expect(componentSwapData[0].dexData.exchange).toEqual(Exchange.None)
    expect(componentSwapData[0].dexData.path).toEqual([
      zeroAddress,
      zeroAddress,
    ])
    expect(componentSwapData[1].dexData.path).toEqual([inputToken, dai])
    expect(componentSwapData[2].dexData.path).toEqual([inputToken, usdt])
    expect(componentSwapData[3].dexData.path).toEqual([inputToken, usdt])
    expect(componentSwapData[4].dexData.path).toEqual([inputToken, dai])
    // Should be empty as input token is equal to output token
    expect(componentSwapData[5].dexData.exchange).toEqual(Exchange.None)
    expect(componentSwapData[5].dexData.path).toEqual([
      zeroAddress,
      zeroAddress,
    ])
    componentSwapData.forEach((swapData, index) => {
      expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
      if (index > 0 && index < 5) {
        expect(swapData.dexData.exchange).toEqual(Exchange.UniV3)
        expect(swapData.dexData.fees.length).toBeGreaterThan(0)
      }
      expect(swapData.dexData.pool).toBe(zeroAddress)
    })
  })

  test('returns correct swap data based when input token is WETH', async () => {
    const inputToken = weth
    const componentSwapData = await getIssuanceComponentSwapData(
      MoneyMarketIndexToken.symbol,
      MoneyMarketIndexToken.address!,
      inputToken,
      wei(1),
      provider,
      zeroExApi
    )
    expect(componentSwapData.length).toBe(6)
    expect(componentSwapData[0].underlyingERC20.toLowerCase()).toBe(usdc)
    expect(componentSwapData[1].underlyingERC20.toLowerCase()).toBe(dai)
    expect(componentSwapData[2].underlyingERC20.toLowerCase()).toBe(usdt)
    expect(componentSwapData[3].underlyingERC20.toLowerCase()).toBe(usdt)
    expect(componentSwapData[4].underlyingERC20.toLowerCase()).toBe(dai)
    expect(componentSwapData[5].underlyingERC20.toLowerCase()).toBe(usdc)
    expect(componentSwapData[0].dexData.path).toEqual([weth, usdc])
    expect(componentSwapData[1].dexData.path).toEqual([weth, dai])
    expect(componentSwapData[2].dexData.path).toEqual([weth, usdt])
    expect(componentSwapData[3].dexData.path).toEqual([weth, usdt])
    expect(componentSwapData[4].dexData.path).toEqual([weth, dai])
    expect(componentSwapData[5].dexData.path).toEqual([weth, usdc])
    componentSwapData.forEach((swapData) => {
      expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
      expect(swapData.dexData.exchange).toBe(Exchange.UniV3)
      // Not great but atm there could be varying pools/fees returned
      expect(swapData.dexData.fees.length).toBeGreaterThan(0)
      expect(swapData.dexData.pool).toBe(zeroAddress)
    })
  })
})

describe.skip('getRedemptionComponentSwapData()', () => {
  test('returns correct swap data based on output token (USDC)', async () => {
    const outputToken = usdc
    const componentSwapData = await getRedemptionComponentSwapData(
      MoneyMarketIndexToken.symbol,
      MoneyMarketIndexToken.address!,
      outputToken,
      wei(1),
      provider,
      zeroExApi
    )
    expect(componentSwapData.length).toBe(6)
    expect(componentSwapData[0].underlyingERC20.toLowerCase()).toBe(usdc)
    expect(componentSwapData[1].underlyingERC20.toLowerCase()).toBe(dai)
    expect(componentSwapData[2].underlyingERC20.toLowerCase()).toBe(usdt)
    expect(componentSwapData[3].underlyingERC20.toLowerCase()).toBe(usdt)
    expect(componentSwapData[4].underlyingERC20.toLowerCase()).toBe(dai)
    expect(componentSwapData[5].underlyingERC20.toLowerCase()).toBe(usdc)
    // Should be empty as input token is equal to output token
    expect(componentSwapData[0].dexData.exchange).toEqual(Exchange.None)
    expect(componentSwapData[0].dexData.path).toEqual([
      zeroAddress,
      zeroAddress,
    ])
    expect(componentSwapData[1].dexData.path).toEqual([dai, usdc])
    expect(componentSwapData[2].dexData.path).toEqual([usdt, usdc])
    expect(componentSwapData[3].dexData.path).toEqual([usdt, usdc])
    expect(componentSwapData[4].dexData.path).toEqual([dai, usdc])
    // Should be empty as input token is equal to output token
    expect(componentSwapData[5].dexData.exchange).toEqual(Exchange.None)
    expect(componentSwapData[5].dexData.path).toEqual([
      zeroAddress,
      zeroAddress,
    ])
    componentSwapData.forEach((swapData, index) => {
      expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
      if (index > 0 && index < 5) {
        expect(swapData.dexData.exchange).toEqual(Exchange.UniV3)
        expect(swapData.dexData.fees.length).toBeGreaterThan(0)
      }
      expect(swapData.dexData.pool).toBe(zeroAddress)
    })
  })

  test('returns correct swap data when output token is WETH', async () => {
    const outputToken = weth
    const componentSwapData = await getRedemptionComponentSwapData(
      MoneyMarketIndexToken.symbol,
      MoneyMarketIndexToken.address!,
      outputToken,
      wei(1),
      provider,
      zeroExApi
    )
    expect(componentSwapData.length).toBe(6)
    expect(componentSwapData[0].underlyingERC20.toLowerCase()).toBe(usdc)
    expect(componentSwapData[1].underlyingERC20.toLowerCase()).toBe(dai)
    expect(componentSwapData[2].underlyingERC20.toLowerCase()).toBe(usdt)
    expect(componentSwapData[3].underlyingERC20.toLowerCase()).toBe(usdt)
    expect(componentSwapData[4].underlyingERC20.toLowerCase()).toBe(dai)
    expect(componentSwapData[5].underlyingERC20.toLowerCase()).toBe(usdc)
    expect(componentSwapData[0].dexData.path).toEqual([usdc, weth])
    expect(componentSwapData[1].dexData.path).toEqual([dai, weth])
    expect(componentSwapData[2].dexData.path).toEqual([usdt, weth])
    expect(componentSwapData[3].dexData.path).toEqual([usdt, weth])
    expect(componentSwapData[4].dexData.path).toEqual([dai, weth])
    expect(componentSwapData[5].dexData.path).toEqual([usdc, weth])
    componentSwapData.forEach((swapData) => {
      expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
      expect(swapData.dexData.exchange).toBe(Exchange.UniV3)
      // Not great but atm there could be varying pools/fees returned
      expect(swapData.dexData.fees.length).toBeGreaterThan(0)
      expect(swapData.dexData.pool).toBe(zeroAddress)
    })
  })
})
