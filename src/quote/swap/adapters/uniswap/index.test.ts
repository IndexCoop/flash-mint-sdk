/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { EthAddress } from 'constants/addresses'
import { ChainId } from 'constants/chains'
import { USDC, WETH } from 'constants/tokens'
import { getAlchemyProviderUrl } from 'tests/utils'

import { Exchange } from 'utils'
import { UniswapSwapQuoteProvider } from './'

const rpcUrl = getAlchemyProviderUrl(ChainId.Mainnet)
const rpcUrlArbitrum = getAlchemyProviderUrl(ChainId.Arbitrum)

const weth = WETH.address!
const usdc = USDC.address!
const ONE = '1000000000000000000'

describe.skip('UniswapSwapQuoteProvider', () => {
  test('returns null if input and output token are the same', async () => {
    const request = {
      chainId: 1,
      inputToken: usdc,
      outputToken: usdc,
      outputAmount: ONE,
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    expect(quote).toBeNull()
  })

  test('returns null if input and output token are ETH/WETH', async () => {
    const request = {
      chainId: 1,
      inputToken: EthAddress,
      outputToken: weth,
      outputAmount: ONE,
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    expect(quote).toBeNull()
  })

  test('getting a swap quote for a specified output amount', async () => {
    const request = {
      chainId: 1,
      inputToken: usdc,
      outputToken: weth,
      outputAmount: ONE,
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.UniV3)
    const path = quote.swapData?.path ?? []
    expect(path.length).toBeGreaterThanOrEqual(2)
    expect(path[0]).toEqual(request.inputToken)
    expect(path[path.length - 1]).toEqual(request.outputToken)
    expect(quote.swapData?.fees.length).toBeGreaterThanOrEqual(1)
    expect(quote.outputAmount).toEqual(request.outputAmount)
    expect(quote.inputAmount).not.toEqual(quote.outputAmount)
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
  })

  test('getting a swap quote for a specified input amount', async () => {
    const request = {
      chainId: 1,
      inputToken: usdc,
      outputToken: weth,
      inputAmount: '100000000',
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.UniV3)
    expect(quote.swapData?.path.length).toBe(2)
    expect(quote.swapData?.path).toEqual([
      request.inputToken,
      request.outputToken,
    ])
    expect(quote.swapData?.fees.length).toBe(1)
    expect(quote.inputAmount).toEqual(request.inputAmount)
    expect(quote.inputAmount).not.toEqual(quote.outputAmount)
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
  })

  test('getting a swap quote for a specified input amount (stETH)', async () => {
    const request = {
      chainId: 1,
      inputToken: usdc,
      outputToken: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      inputAmount: '100000000',
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.Quickswap)
    expect(quote.swapData?.path.length).toBe(3)
    expect(quote.swapData?.path).toEqual([
      request.inputToken,
      weth,
      request.outputToken,
    ])
    expect(quote.swapData?.fees).toEqual([3000, 3000])
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
  })

  test('getting a swap quote for a specified input amount - Arbitrum', async () => {
    const request = {
      chainId: ChainId.Arbitrum,
      inputToken: EthAddress,
      outputToken: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // wBTC
      inputAmount: ONE,
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrlArbitrum)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData).toEqual({
      exchange: 3,
      path: [
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      ],
      fees: [500],
      pool: '0x0000000000000000000000000000000000000000',
    })
    // expect(quote.callData).not.toBe('0x')
    expect(quote.inputAmount).toEqual(request.inputAmount)
    expect(quote.inputAmount).not.toEqual(quote.outputAmount)
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
  })

  test('getting a swap quote for a specified input amount - Arbitrum', async () => {
    const request = {
      chainId: ChainId.Arbitrum,
      inputToken: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // wBTC
      outputToken: EthAddress,
      inputAmount: ONE,
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrlArbitrum)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.UniV3)
    const path = quote.swapData?.path ?? []
    expect(path.length).toBeGreaterThanOrEqual(2)
    expect(path[0]).toEqual(request.inputToken)
    expect(path[path.length - 1]).toEqual(
      '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    )
    expect(quote.swapData?.fees.length).toBeGreaterThanOrEqual(1)
    // expect(quote.callData).not.toBe('0x')
    expect(quote.inputAmount).toEqual(request.inputAmount)
    expect(quote.inputAmount).not.toEqual(quote.outputAmount)
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
  })

  test('getting a swap quote for a specified input amount - Arbitrum', async () => {
    const request = {
      chainId: ChainId.Arbitrum,
      inputToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
      outputToken: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC
      outputAmount: '100000000',
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrlArbitrum)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData).toEqual({
      exchange: 3,
      path: [
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      ],
      fees: [500],
      pool: '0x0000000000000000000000000000000000000000',
    })
    // expect(quote.callData).not.toBe('0x')
    expect(quote.outputAmount).toEqual(request.outputAmount)
    expect(quote.inputAmount).not.toEqual(quote.outputAmount)
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
  })
})
