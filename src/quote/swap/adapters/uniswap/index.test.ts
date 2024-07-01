/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { WETH } from 'constants/tokens'
import { AlchemyProviderUrl } from 'tests/utils'

import { UniswapSwapQuoteProvider } from './'
import { Exchange } from 'utils'

const rpcUrl = AlchemyProviderUrl

const weth = WETH.address!
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const ONE = '1000000000000000000'

describe('UniswapSwapQuoteProvider', () => {
  test('getting a swap quote for a specified output amount', async () => {
    const request = {
      chainId: 1,
      inputToken: weth,
      outputToken: USDC,
      outputAmount: '100000000',
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
    expect(quote.inputAmount).not.toBeNull()
  })

  test('getting a swap quote for a specified input amount', async () => {
    const request = {
      chainId: 1,
      inputToken: weth,
      outputToken: USDC,
      inputAmount: ONE,
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
    expect(quote.outputAmount).not.toBeNull()
  })
})
