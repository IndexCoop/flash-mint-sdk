import 'dotenv/config'

import { ZeroExV2SwapQuoteProvider } from 'quote/swap/adapters/zeroex_v2'

const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

describe('ZeroExApi', () => {
  let quoteProvider: ZeroExV2SwapQuoteProvider

  beforeEach(() => {
    quoteProvider = new ZeroExV2SwapQuoteProvider(process.env.ZEROEX_API_KEY!)
  })

  test.only('building a url', async () => {
    const request = {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      inputToken: USDC,
      outputToken: ETH,
      inputAmount: '100000000',
      slippage: 0.1,
    }
    const quote = await quoteProvider.getSwapQuote(request)
    // TODO:
    console.log(quote, 'test')
  })

  test('should handle no liquidity available', async () => {
    const request = {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      inputToken: ETH,
      outputToken: '0x1B5E16C5b20Fb5EE87C61fE9Afe735Cca3B21A65', // ic21
      inputAmount: '1000000000000000000',
      slippage: 0.5,
    }
    await expect(quoteProvider.getSwapQuote(request)).rejects.toThrow(
      'Insufficient liquidity for swap',
    )
  })
})
