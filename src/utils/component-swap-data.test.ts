/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressZero } from 'constants/addresses'
import { TheUSDCYieldIndex, USDC } from 'constants/tokens'
import {
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from 'utils/component-swap-data'
import { wei } from 'utils/numbers'
import { IndexZeroExSwapQuoteProvider, LocalhostProviderUrl } from 'tests/utils'
import { isSameAddress } from 'utils/addresses'
import { Exchange } from 'utils/swap-data'
import { BigNumber } from '@ethersproject/bignumber'

const chainId = 1
const rpcUrl = LocalhostProviderUrl
const swapQuoteProvider = IndexZeroExSwapQuoteProvider

const indexTokenSymbol = TheUSDCYieldIndex.symbol
const indexToken = TheUSDCYieldIndex.address!
const usdc = USDC.address!

describe('getIssuanceComponentSwapData()', () => {
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
    }
    // TODO: update once rebalanced into components
    expect(componentSwapData[0].buyUnderlyingAmount.toString()).toBe('1000000')
  })

  //   test('returns correct swap data based when input token is WETH', async () => {
  //     const inputToken = weth
  //     const componentSwapData = await getIssuanceComponentSwapData(
  //       MoneyMarketIndexToken.symbol,
  //       MoneyMarketIndexToken.address!,
  //       inputToken,
  //       wei(1),
  //       provider,
  //       zeroExApi
  //     )
  //     expect(componentSwapData.length).toBe(6)
  //     expect(componentSwapData[0].underlyingERC20.toLowerCase()).toBe(usdc)
  //     expect(componentSwapData[1].underlyingERC20.toLowerCase()).toBe(dai)
  //     expect(componentSwapData[2].underlyingERC20.toLowerCase()).toBe(usdt)
  //     expect(componentSwapData[3].underlyingERC20.toLowerCase()).toBe(usdt)
  //     expect(componentSwapData[4].underlyingERC20.toLowerCase()).toBe(dai)
  //     expect(componentSwapData[5].underlyingERC20.toLowerCase()).toBe(usdc)
  //     expect(componentSwapData[0].dexData.path).toEqual([weth, usdc])
  //     expect(componentSwapData[1].dexData.path).toEqual([weth, dai])
  //     expect(componentSwapData[2].dexData.path).toEqual([weth, usdt])
  //     expect(componentSwapData[3].dexData.path).toEqual([weth, usdt])
  //     expect(componentSwapData[4].dexData.path).toEqual([weth, dai])
  //     expect(componentSwapData[5].dexData.path).toEqual([weth, usdc])
  //     componentSwapData.forEach((swapData) => {
  //       expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
  //       expect(swapData.dexData.exchange).toBe(Exchange.UniV3)
  //       // Not great but atm there could be varying pools/fees returned
  //       expect(swapData.dexData.fees.length).toBeGreaterThan(0)
  //       expect(swapData.dexData.pool).toBe(zeroAddress)
  //     })
  //   })
})

describe('getRedemptionComponentSwapData()', () => {
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
    }
    // TODO: update once rebalanced into components
    expect(componentSwapData[0].buyUnderlyingAmount.toString()).toBe('1000000')
  })
})

//   test('returns correct swap data when output token is WETH', async () => {
//     const outputToken = weth
//     const componentSwapData = await getRedemptionComponentSwapData(
//       MoneyMarketIndexToken.symbol,
//       MoneyMarketIndexToken.address!,
//       outputToken,
//       wei(1),
//       provider,
//       zeroExApi
//     )
//     expect(componentSwapData.length).toBe(6)
//     expect(componentSwapData[0].underlyingERC20.toLowerCase()).toBe(usdc)
//     expect(componentSwapData[1].underlyingERC20.toLowerCase()).toBe(dai)
//     expect(componentSwapData[2].underlyingERC20.toLowerCase()).toBe(usdt)
//     expect(componentSwapData[3].underlyingERC20.toLowerCase()).toBe(usdt)
//     expect(componentSwapData[4].underlyingERC20.toLowerCase()).toBe(dai)
//     expect(componentSwapData[5].underlyingERC20.toLowerCase()).toBe(usdc)
//     expect(componentSwapData[0].dexData.path).toEqual([usdc, weth])
//     expect(componentSwapData[1].dexData.path).toEqual([dai, weth])
//     expect(componentSwapData[2].dexData.path).toEqual([usdt, weth])
//     expect(componentSwapData[3].dexData.path).toEqual([usdt, weth])
//     expect(componentSwapData[4].dexData.path).toEqual([dai, weth])
//     expect(componentSwapData[5].dexData.path).toEqual([usdc, weth])
//     componentSwapData.forEach((swapData) => {
//       expect(swapData.buyUnderlyingAmount.gt(0)).toBe(true)
//       expect(swapData.dexData.exchange).toBe(Exchange.UniV3)
//       // Not great but atm there could be varying pools/fees returned
//       expect(swapData.dexData.fees.length).toBeGreaterThan(0)
//       expect(swapData.dexData.pool).toBe(zeroAddress)
//     })
//   })
// })
