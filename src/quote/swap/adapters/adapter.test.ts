/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ETH, stETH, WETH } from 'constants/tokens'
import { AlchemyProviderUrl } from 'tests/utils'

import { IndexSwapQuoteProvider } from './adapter'
import { Exchange } from 'utils'

const rpcUrl = AlchemyProviderUrl

// ETH/stETH
const curvePool = '0xdc24316b9ae028f1497c275eb9192a3ea0f67022'
const eth = ETH.address!
const steth = stETH.address!
const weth = WETH.address!
const ONE = '1000000000000000000'

describe('CurveSwapQuoteProvider', () => {
  test('returns a swap quote for buying stETH with ETH', async () => {
    const request = {
      chainId: 1,
      inputToken: eth,
      outputToken: steth,
      outputAmount: ONE,
    }
    const provider = new IndexSwapQuoteProvider()
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.Curve)
    expect(quote.swapData?.path.length).toBe(2)
    expect(quote.swapData?.fees.length).toBe(0)
    expect(quote.swapData?.path).toEqual([weth, steth])
    expect(quote.swapData?.pool).toBe(curvePool)
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
  })

  test('returns a swap quote for selling stETH for ETH', async () => {
    const request = {
      chainId: 1,
      inputToken: steth,
      outputToken: eth,
      inputAmount: ONE,
    }
    const provider = new IndexSwapQuoteProvider()
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.Curve)
    expect(quote.swapData?.path.length).toBe(2)
    expect(quote.swapData?.fees.length).toBe(0)
    expect(quote.swapData?.path).toEqual([weth, steth])
    expect(quote.swapData?.pool).toBe(curvePool)
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
  })
})
