/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { USDC, WETH } from 'constants/tokens'
import { AlchemyProviderUrl } from 'tests/utils'

import { UniswapSwapQuoteProvider } from './'
import { Exchange } from 'utils'

const rpcUrl = AlchemyProviderUrl

const weth = WETH.address!
const usdc = USDC.address!
const ONE = '1000000000000000000'

describe('UniswapSwapQuoteProvider', () => {
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
    expect(quote.swapData?.path.length).toBe(2)
    expect(quote.swapData?.fees.length).toBe(1)
    expect(quote.swapData?.path).toEqual([
      request.inputToken,
      request.outputToken,
    ])
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
    expect(quote.swapData?.fees.length).toBe(1)
    expect(quote.swapData?.path).toEqual([
      request.inputToken,
      request.outputToken,
    ])
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
  })

  test('getting a swap quote for a specified input amount', async () => {
    const request = {
      chainId: 1,
      inputToken: usdc,
      // TODO: check why it doesn't work with stETH (just wstETH)
      outputToken: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
      inputAmount: '100000000',
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.UniV3)
    expect(quote.swapData?.path.length).toBe(3)
    expect(quote.swapData?.fees.length).toBe(2)
    expect(quote.swapData?.path).toEqual([
      request.inputToken,
      weth,
      request.outputToken,
    ])
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
  })
})
