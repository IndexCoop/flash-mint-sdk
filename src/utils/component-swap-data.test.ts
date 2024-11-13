import { AddressZero } from 'constants/addresses'
import { ChainId } from 'constants/chains'

import {
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from 'utils/component-swap-data'
import { wei } from 'utils/numbers'
import {
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
} from 'tests/utils'
import { isSameAddress } from 'utils/addresses'
import { Exchange } from 'utils/swap-data'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { BigNumber } from '@ethersproject/bignumber'

const chainId = ChainId.Base
const rpcUrl = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)

const icUsd = getTokenByChainAndSymbol(chainId, 'icUSD')
const indexTokenSymbol = icUsd.symbol
const indexToken = icUsd.address
const usdc = getTokenByChainAndSymbol(chainId, 'USDC').address
const weth = getTokenByChainAndSymbol(chainId, 'WETH').address

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
    console.log(componentSwapData)
    expect(componentSwapData.length).toBe(5)
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
    expect(componentSwapData[0].buyUnderlyingAmount.gt(BigNumber.from(0))).toBe(
      true
    )
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
    expect(componentSwapData.length).toBe(5)
    for (let i = 0; i < componentSwapData.length; i++) {
      expect(isSameAddress(componentSwapData[i].underlyingERC20, usdc)).toBe(
        true
      )
      const dexData = componentSwapData[i].dexData
      expect(dexData.exchange).toEqual(Exchange.UniV3)
      expect(dexData.fees.length).toBeGreaterThan(0)
      expect(dexData.path[0]).toEqual(weth)
      expect(dexData.path[dexData.path.length - 1]).toEqual(usdc.toLowerCase())
      expect(dexData.pool).toEqual(AddressZero)
      expect(dexData.poolIds).toEqual([])
    }
    expect(componentSwapData[0].buyUnderlyingAmount.gt(BigNumber.from(0))).toBe(
      true
    )
  })
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
    expect(componentSwapData.length).toBe(5)
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
    expect(componentSwapData[0].buyUnderlyingAmount.gt(BigNumber.from(0))).toBe(
      true
    )
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
    expect(componentSwapData.length).toBe(5)
    for (let i = 0; i < componentSwapData.length; i++) {
      expect(isSameAddress(componentSwapData[i].underlyingERC20, usdc)).toBe(
        true
      )
      const dexData = componentSwapData[i].dexData
      expect(dexData.exchange).toEqual(Exchange.UniV3)
      expect(dexData.fees.length).toBeGreaterThan(0)
      expect(dexData.path).toEqual([usdc.toLowerCase(), weth])
      expect(dexData.pool).toEqual(AddressZero)
      expect(dexData.poolIds).toEqual([])
    }
    expect(componentSwapData[0].buyUnderlyingAmount.gt(BigNumber.from(0))).toBe(
      true
    )
  })
})
