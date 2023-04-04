import { DAI, MoneyMarketIndex, USDC, WETH } from 'constants/tokens'
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

  test('returns a quote for minting MMI w/ DAI', async () => {
    const inputToken: QuoteToken = {
      address: DAI.address!,
      decimals: 18,
      symbol: DAI.symbol,
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
    expect(quote.componentSwapData.length).toEqual(6)
    expect(quote.componentWrapData.length).toEqual(6)
  })

  test('returns a quote for minting MMI w/ USDC', async () => {
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
    expect(quote.componentSwapData.length).toEqual(6)
    expect(quote.componentWrapData.length).toEqual(6)
  })

  test('returns a quote for minting MMI w/ WETH', async () => {
    const inputToken: QuoteToken = {
      address: WETH.address!,
      decimals: 18,
      symbol: WETH.symbol,
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
    expect(quote.componentSwapData.length).toEqual(6)
    expect(quote.componentWrapData.length).toEqual(6)
  })

  test.skip('returns a quote for redeeming MMI', async () => {
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
    expect(quote.componentSwapData.length).toBeGreaterThan(0)
    expect(quote.componentWrapData.length).toBeGreaterThan(0)
    expect(quote.componentSwapData.length).toEqual(
      quote.componentWrapData.length
    )
  })
})
