import 'dotenv/config'

import { EthAddress } from 'constants/addresses'
import { LiFiSwapQuoteProvider } from './'

const apiKey = process.env.LIFI_API_KEY!
const integrator = 'indexcoop'

const ETH = EthAddress
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const ONE = '1000000000000000000'

const LiFiDiamondProxy = '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE'
const taker = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

describe('LifiSwapQuoteProvider', () => {
  test('getting a swap quote for a specified input amount', async () => {
    const request = {
      chainId: 1,
      inputToken: ETH,
      outputToken: USDC,
      inputAmount: ONE,
      slippage: 0.5,
      taker,
    }
    const provider = new LiFiSwapQuoteProvider(apiKey, integrator)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.swapTarget).toBe(LiFiDiamondProxy)
    expect(quote.swapData?.callData).not.toBe('0x')
    expect(BigInt(quote.outputAmount) > BigInt(0)).toBe(true)
  })

  test('getting a swap quote for a specified output amount', async () => {
    const request = {
      chainId: 1,
      inputToken: ETH,
      outputToken: USDC,
      outputAmount: '1000000',
      slippage: 0.5,
      taker,
    }
    const provider = new LiFiSwapQuoteProvider(apiKey, integrator)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.swapData?.swapTarget).toBe(LiFiDiamondProxy)
    expect(quote.swapData?.callData).not.toBe('0x')
    expect(BigInt(quote.inputAmount) > BigInt(0)).toBe(true)
  })
})
