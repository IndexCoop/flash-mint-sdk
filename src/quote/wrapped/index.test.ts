import { MoneyMarketIndex, USDC, WETH } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { LocalhostProvider } from 'tests/utils'
import { wei } from 'utils/numbers'
import { FlashMintWrappedQuoteRequest, WrappedQuoteProvider } from '.'

const provider = LocalhostProvider

const indexToken: QuoteToken = {
  address: MoneyMarketIndex.address!,
  decimals: 18,
  symbol: MoneyMarketIndex.symbol,
}

describe('WrappedQuoteProvider()', () => {
  beforeEach((): void => {
    jest.setTimeout(100000000)
  })

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
    expect(quote.inputOutputTokenAmount.gt(0)).toEqual(true)
  })

  test('returns a quote for redeeming MMI', async () => {
    const outputToken: QuoteToken = {
      address: USDC.address!,
      decimals: 6,
      symbol: USDC.symbol,
    }
    const request: FlashMintWrappedQuoteRequest = {
      isMinting: false,
      inputToken: indexToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new WrappedQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toEqual(true)
  })
})
