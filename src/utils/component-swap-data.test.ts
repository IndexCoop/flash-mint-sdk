/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressZero } from 'constants/addresses'
import { TheUSDCYieldIndex, USDC, WETH } from 'constants/tokens'
import {
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from 'utils/component-swap-data'
import { wei } from 'utils/numbers'
import { IndexZeroExSwapQuoteProvider, LocalhostProviderUrl } from 'tests/utils'
import { isSameAddress } from 'utils/addresses'
import { Exchange } from 'utils/swap-data'

const chainId = 1
const rpcUrl = LocalhostProviderUrl
const swapQuoteProvider = IndexZeroExSwapQuoteProvider

const indexTokenSymbol = TheUSDCYieldIndex.symbol
const indexToken = TheUSDCYieldIndex.address!
const usdc = USDC.address!
const weth = WETH.address!

describe.skip('getIssuanceComponentSwapData()', () => {
  test('returns correct swap data based on input token USDC', async () => {
    const componentSwapData = await getIssuanceComponentSwapData(
      {
        chainId,
        indexTokenSymbol,
        indexToken,
        inputToken: usdc,
        indexTokenAmount: wei(1),
      },
      rpcUrl,
      swapQuoteProvider
    )
    // TODO: update once rebalanced into components
    expect(componentSwapData.length).toBe(1)
    for (let i = 0; i < componentSwapData.length; i++) {
      expect(isSameAddress(componentSwapData[i].underlyingERC20, usdc)).toBe(
        true
      )
      // Should be empty as input token is equal to output token (underlying erc20)
      const dexData = componentSwapData[i].dexData
      expect(dexData.exchange).toEqual(Exchange.None)
      expect(dexData.fees).toEqual([])
      expect(dexData.path).toEqual([])
      expect(dexData.pool).toEqual(AddressZero)
      expect(dexData.poolIds).toEqual([])
    }
    // TODO: update once rebalanced into components
    expect(componentSwapData[0].buyUnderlyingAmount.toString()).toBe('1000010')
  })

  test('returns correct swap data based when input token is WETH', async () => {
    const componentSwapData = await getIssuanceComponentSwapData(
      {
        chainId,
        indexTokenSymbol,
        indexToken,
        inputToken: weth,
        indexTokenAmount: wei(1),
      },
      rpcUrl,
      swapQuoteProvider
    )
    // TODO: update once rebalanced into components
    expect(componentSwapData.length).toBe(1)
    for (let i = 0; i < componentSwapData.length; i++) {
      expect(isSameAddress(componentSwapData[i].underlyingERC20, usdc)).toBe(
        true
      )
      // Should be empty as input token is equal to output token (underlying erc20)
      const dexData = componentSwapData[i].dexData
      expect(dexData.exchange).toEqual(Exchange.UniV3)
      expect(dexData.fees.length).toBeGreaterThan(0)
      expect(dexData.path).toEqual([
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      ])
      expect(dexData.pool).toEqual(AddressZero)
      expect(dexData.poolIds).toEqual([])
    }
    // TODO: update once rebalanced into components
    expect(componentSwapData[0].buyUnderlyingAmount.toString()).toBe('1000010')
  })
})

describe.skip('getRedemptionComponentSwapData()', () => {
  test('returns correct swap data based for output token USDC', async () => {
    const componentSwapData = await getRedemptionComponentSwapData(
      {
        chainId,
        indexTokenSymbol,
        indexToken,
        outputToken: usdc,
        indexTokenAmount: wei(1),
      },
      rpcUrl,
      swapQuoteProvider
    )
    // TODO: update once rebalanced into components
    expect(componentSwapData.length).toBe(1)
    for (let i = 0; i < componentSwapData.length; i++) {
      expect(isSameAddress(componentSwapData[i].underlyingERC20, usdc)).toBe(
        true
      )
      // Should be empty as input token is equal to output token (underlying erc20)
      const dexData = componentSwapData[i].dexData
      expect(dexData.exchange).toEqual(Exchange.None)
      expect(dexData.fees).toEqual([])
      expect(dexData.path).toEqual([])
      expect(dexData.pool).toEqual(AddressZero)
      expect(dexData.poolIds).toEqual([])
    }
    // TODO: update once rebalanced into components
    expect(componentSwapData[0].buyUnderlyingAmount.toString()).toBe('999990')
  })

  test('returns correct swap data when output token is WETH', async () => {
    const componentSwapData = await getRedemptionComponentSwapData(
      {
        chainId,
        indexTokenSymbol,
        indexToken,
        outputToken: weth,
        indexTokenAmount: wei(1),
      },
      rpcUrl,
      swapQuoteProvider
    )
    // TODO: update once rebalanced into components
    expect(componentSwapData.length).toBe(1)
    for (let i = 0; i < componentSwapData.length; i++) {
      expect(isSameAddress(componentSwapData[i].underlyingERC20, usdc)).toBe(
        true
      )
      // Should be empty as input token is equal to output token (underlying erc20)
      const dexData = componentSwapData[i].dexData
      expect(dexData.exchange).toEqual(Exchange.UniV3)
      expect(dexData.fees.length).toBeGreaterThan(0)
      expect(dexData.path).toEqual([
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      ])
      expect(dexData.pool).toEqual(AddressZero)
      expect(dexData.poolIds).toEqual([])
    }
    // TODO: update once rebalanced into components
    expect(componentSwapData[0].buyUnderlyingAmount.toString()).toBe('999990')
  })
})
