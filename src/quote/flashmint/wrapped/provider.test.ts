import {
  IndexZeroExSwapQuoteProvider,
  LocalhostProviderUrl,
  QuoteTokens,
} from 'tests/utils'
import { wei } from 'utils/numbers'
import { FlashMintWrappedQuoteRequest, WrappedQuoteProvider } from '.'

const { icusd, usdc, weth } = QuoteTokens
const indexToken = icusd
const chainId = 1
const provider = LocalhostProviderUrl
const swapQuoteProvider = IndexZeroExSwapQuoteProvider

describe('WrappedQuoteProvider()', () => {
  test.only('returns a quote for minting icUSD', async () => {
    const inputToken = usdc
    const request: FlashMintWrappedQuoteRequest = {
      chainId,
      isMinting: true,
      inputToken,
      outputToken: indexToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new WrappedQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    // FIXME: test
    // expect(quote.inputOutputTokenAmount.gt(0)).toEqual(true)
    expect(quote.componentSwapData.length).toEqual(6)
    expect(quote.componentWrapData.length).toEqual(5)
  })

  test('returns a quote for minting MMI w/ icUSD', async () => {
    const inputToken = usdc
    const request: FlashMintWrappedQuoteRequest = {
      chainId,
      isMinting: true,
      inputToken,
      outputToken: indexToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new WrappedQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toEqual(true)
    expect(quote.componentSwapData.length).toEqual(6)
  })

  test('returns a quote for minting icUSD w/ WETH', async () => {
    const inputToken = weth
    const request: FlashMintWrappedQuoteRequest = {
      chainId,
      isMinting: true,
      inputToken,
      outputToken: indexToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new WrappedQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toEqual(true)
    expect(quote.componentSwapData.length).toEqual(6)
  })

  test.only('returns a quote redeeming icUSD for USDC', async () => {
    const outputToken = usdc
    const request: FlashMintWrappedQuoteRequest = {
      chainId,
      isMinting: false,
      inputToken: indexToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new WrappedQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    // FIXME:
    // expect(quote.inputOutputTokenAmount.gt(0)).toEqual(true)
    expect(quote.componentSwapData.length).toEqual(6)
    expect(quote.componentWrapData.length).toEqual(5)
  })

  test('returns a quote for redeeming icUSD for WETH', async () => {
    const outputToken = weth
    const request: FlashMintWrappedQuoteRequest = {
      chainId,
      isMinting: false,
      inputToken: indexToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new WrappedQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toEqual(true)
    expect(quote.componentSwapData.length).toEqual(6)
  })
})
