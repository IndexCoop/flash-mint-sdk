import { MoneyMarketIndex, USDC } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { LocalhostProvider } from 'tests/utils'
import { ZeroExApiSwapQuote } from 'tests/utils'
import { wei } from 'utils/numbers'
import { FlashMintWrappedQuoteRequest, WrappedQuoteProvider } from '.'

const provider = LocalhostProvider
// const zeroExApi = ZeroExApiSwapQuote

const indexToken: QuoteToken = {
  address: MoneyMarketIndex.address!,
  decimals: 18,
  symbol: MoneyMarketIndex.symbol,
}

describe('WrappedQuoteProvider()', () => {
  test('returns a quote for minting MMI', async () => {
    const inputToken: QuoteToken = {
      address: USDC.address!,
      decimals: 6,
      symbol: USDC.symbol,
    }
    const request: FlashMintWrappedQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken: indexToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new WrappedQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
  })
})
