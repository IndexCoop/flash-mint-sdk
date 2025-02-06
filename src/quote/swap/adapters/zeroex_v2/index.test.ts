import 'dotenv/config'

import { ZeroExV2SwapQuoteProvider } from 'quote/swap/adapters/zeroex_v2'

const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

describe('ZeroExApi', () => {
  test('building a url', async () => {
    const request = {
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      inputToken: USDC,
      outputToken: ETH,
      inputAmount: '100000000',
    }
    const quoteProvider = new ZeroExV2SwapQuoteProvider(
      process.env.ZEROEX_API_KEY!,
    )
    const quote = await quoteProvider.getSwapQuote(request)
    console.log(quote, 'test')
  })
})
