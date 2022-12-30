import 'dotenv/config'
import { BigNumber } from '@ethersproject/bignumber'

import { MetaverseIndex, WETH } from 'constants/tokens'
import { ZeroExApi } from 'utils/0x'

import { ComponentsQuoteProvider } from './componentsQuoteProvider'

const index0xApiBaseUrl = process.env.INDEX_0X_API

const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'

describe('ComponentsQuoteProvider - getComponentQuotes()', () => {
  const chainId = 1
  const slippage = 1
  const zeroExApi = new ZeroExApi(
    index0xApiBaseUrl,
    '',
    { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
    '/mainnet/swap/v1/quote'
  )
  const quoteProvider = new ComponentsQuoteProvider(
    chainId,
    slippage,
    WETH.address!,
    zeroExApi
  )

  test('returns component quotes', async () => {
    const components: string[] = [
      '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    ]
    const positions: BigNumber[] = [
      BigNumber.from('0x3040d55f9b8c7f2e'),
      BigNumber.from('0x394561ac3ad65f3b'),
      BigNumber.from('0x2f634f09200bacc2'),
    ]
    const isMinting = true
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const result = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (!result) {
      fail()
    }
    const { componentQuotes, inputOutputTokenAmount } = result
    expect(componentQuotes.length).toEqual(components.length)
    expect(inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test('returns correct result when one component is same as input token', async () => {
    const components: string[] = [
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
      WETH.address!,
    ]
    const positions: BigNumber[] = [BigNumber.from('4'), BigNumber.from('3')]
    const isMinting = true
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const result = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (!result) {
      fail()
    }
    const { componentQuotes, inputOutputTokenAmount } = result
    expect(componentQuotes.length).toEqual(components.length)
    expect(componentQuotes[1]).toEqual(
      '0x0000000000000000000000000000000000000000'
    )
    // When the input token equals the component, the position amount should just be
    // added to the input/ouput token amount. So the result should be greater than that.
    expect(inputOutputTokenAmount.gt(3)).toBe(true)
  })

  test('returns correct result with only one component', async () => {
    const components: string[] = ['0x0F5D2fB29fb7d3CFeE444a200298f468908cC942']
    const positions: BigNumber[] = [BigNumber.from('4')]
    const isMinting = true
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const result = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (!result) {
      fail()
    }
    const { componentQuotes, inputOutputTokenAmount } = result
    expect(componentQuotes.length).toEqual(components.length)
    expect(componentQuotes[0]).not.toEqual(
      '0x0000000000000000000000000000000000000000'
    )
    expect(inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test('returns correct result with only one component - which is same as input/output token', async () => {
    const components: string[] = [WETH.address!]
    const positions: BigNumber[] = [BigNumber.from('3')]
    const isMinting = true
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const result = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (!result) {
      fail()
    }
    const { componentQuotes, inputOutputTokenAmount } = result
    expect(componentQuotes.length).toEqual(components.length)
    expect(componentQuotes[0]).toEqual(
      '0x0000000000000000000000000000000000000000'
    )
    // When the input token equals the component, the position amount should just be
    // added to the input/ouput token amount. So the result should be equal to that.
    expect(inputOutputTokenAmount.eq(3)).toBe(true)
  })

  test('returns null when components are empty', async () => {
    const components: string[] = []
    const positions: BigNumber[] = [BigNumber.from('3')]
    const isMinting = true
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const result = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (result) {
      fail()
    }
    expect(result).toBeNull()
  })

  test('returns null when positions are empty', async () => {
    const components: string[] = [WETH.address!]
    const positions: BigNumber[] = []
    const isMinting = true
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const result = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (result) {
      fail()
    }
    expect(result).toBeNull()
  })

  test('returns null if components and positions have different length', async () => {
    const components: string[] = [WETH.address!, WETH.address!]
    const positions: BigNumber[] = [BigNumber.from(3)]
    const isMinting = true
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const result = await quoteProvider.getComponentQuotes(
      components,
      positions,
      isMinting,
      inputToken,
      outputToken
    )
    if (result) {
      fail()
    }
    expect(result).toBeNull()
  })
})

describe('ComponentsQuoteProvider - getTokenAddressOrWeth()', () => {
  test('returns token address when appropriate', async () => {
    const chainId = 1
    const slippage = 1
    const zeroExApi = new ZeroExApi(
      index0xApiBaseUrl,
      '',
      { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
      '/mainnet/swap/v1/quote'
    )
    const quoteProvider = new ComponentsQuoteProvider(
      chainId,
      slippage,
      WETH.address!,
      zeroExApi
    )
    const token = {
      address: USDC,
      decimals: 6,
      symbol: 'USDC',
    }
    const address = quoteProvider.getTokenAddressOrWeth(token)
    expect(address).toEqual(USDC)
  })

  test('returns WETH when token is ETH', async () => {
    const chainId = 1
    const slippage = 1
    const zeroExApi = new ZeroExApi(
      index0xApiBaseUrl,
      '',
      { 'X-INDEXCOOP-API-KEY': process.env.INDEX_0X_API_KEY! },
      '/mainnet/swap/v1/quote'
    )
    const quoteProvider = new ComponentsQuoteProvider(
      chainId,
      slippage,
      WETH.address!,
      zeroExApi
    )
    const token = {
      address: '0xeeeeee',
      decimals: 18,
      symbol: 'ETH',
    }
    const address = quoteProvider.getTokenAddressOrWeth(token)
    expect(address).toEqual(WETH.address)
  })
})
