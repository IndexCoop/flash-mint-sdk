/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import { ETH } from 'constants/tokens'
import { getAlchemyProviderUrl } from 'tests/utils'
import { Exchange } from 'utils'

import { CurveSwapQuoteProvider } from './'

const chainId = 1
const rpcUrl = getAlchemyProviderUrl(chainId)

// ETH/stETH
const curvePool = '0xdc24316b9ae028f1497c275eb9192a3ea0f67022'
const eth = ETH.address!
const steth = getTokenByChainAndSymbol(chainId, 'stETH').address
const weth = getTokenByChainAndSymbol(chainId, 'WETH').address
const ONE = '1000000000000000000'

describe('CurveSwapQuoteProvider', () => {
  test('getting a swap quote for buying stETH', async () => {
    const request = {
      chainId: 1,
      inputToken: eth,
      outputToken: steth,
      outputAmount: ONE,
    }
    const provider = new CurveSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.Curve)
    expect(quote.swapData?.path.length).toBe(2)
    expect(quote.swapData?.fees.length).toBe(0)
    expect(isAddressEqual(quote.swapData?.path[0], weth)).toBe(true)
    expect(
      isAddressEqual(
        quote.swapData?.path[quote.swapData.path.length - 1],
        steth,
      ),
    ).toBe(true)
    expect(quote.swapData?.pool).toBe(curvePool)
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
  })

  test('getting a swap quote for selling stETH', async () => {
    const request = {
      chainId: 1,
      inputToken: steth,
      outputToken: eth,
      inputAmount: ONE,
    }
    const provider = new CurveSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.Curve)
    expect(quote.swapData?.path.length).toBe(2)
    expect(quote.swapData?.fees.length).toBe(0)
    expect(isAddressEqual(quote.swapData?.path[0], weth)).toBe(true)
    expect(
      isAddressEqual(
        quote.swapData?.path[quote.swapData.path.length - 1],
        steth,
      ),
    ).toBe(true)
    expect(quote.swapData?.pool).toBe(curvePool)
    // expect(quote.callData).not.toBe('0x')
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
  })
})
