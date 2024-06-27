/* eslint-disable @typescript-eslint/no-non-null-assertion */
import 'dotenv/config'

import { EthAddress } from 'constants/addresses'

import { UniswapSwapQuoteProvider } from './'

const rpcUrl = process.env.MAINNET_ALCHEMY_API!

const ETH = EthAddress
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const ONE = '1000000000000000000'

describe('UniswapSwapQuoteProvider', () => {
  test.skip('getting a swap quote for a specified output amount', async () => {
    const request = {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      inputToken: ETH,
      outputToken: USDC,
      outputAmount: '1000000',
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.callData).not.toBe('0x')
    expect(quote.inputAmount).not.toBeNull()
  })

  test('getting a swap quote for a specified input amount', async () => {
    const request = {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      inputToken: ETH,
      outputToken: USDC,
      inputAmount: ONE,
    }
    const provider = new UniswapSwapQuoteProvider(rpcUrl)
    const quote = await provider.getSwapQuote(request)
    if (!quote) fail()
    expect(quote).not.toBeNull()
    expect(quote.callData).not.toBe('0x')
    expect(quote.inputAmount).not.toBeNull()
  })
})
