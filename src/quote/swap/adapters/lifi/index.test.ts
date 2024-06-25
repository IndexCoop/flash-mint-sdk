/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config'

import { EthAddress } from 'constants/addresses'

import { LiFiSwapQuoteProvider } from './'

const apiKey = process.env.LIFI_API_KEY!
const integrator = 'indexcoop'

const ETH = EthAddress
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const ONE = '1000000000000000000'

describe('LifiSwapQuoteProvider', () => {
  test('getting a swap quote for a specified output amount', async () => {
    const request = {
      chainId: 1,
      inputToken: ETH,
      outputToken: USDC,
      outputAmount: '1000000',
    }
    const provider = new LiFiSwapQuoteProvider(apiKey, integrator)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.callData).not.toBe('0x')
    expect(quote.inputAmount).not.toBeNull()
  })

  test('getting a swap quote for a specified input amount', async () => {
    const request = {
      chainId: 1,
      inputToken: ETH,
      outputToken: USDC,
      inputAmount: ONE,
    }
    const provider = new LiFiSwapQuoteProvider(apiKey, integrator)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.callData).not.toBe('0x')
    expect(quote.inputAmount).not.toBeNull()
  })
})
