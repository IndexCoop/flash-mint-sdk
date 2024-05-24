import 'dotenv/config'

import {
  IndexZeroExSwapQuoteProvider,
  LocalhostProvider,
  QuoteTokens,
} from 'tests/utils'
import { wei } from 'utils'
import { ZeroExQuoteProvider } from './provider'

const provider = LocalhostProvider
const swapQuoteProvider = IndexZeroExSwapQuoteProvider

const { dpi, dseth, eth, mvi } = QuoteTokens

describe('ZeroExQuoteProvider', () => {
  beforeEach((): void => {
    jest.setTimeout(100000)
  })

  test('returns a quote for minting dsETH', async () => {
    const indexTokenAmount = wei(1)
    const inputToken = eth
    const outputToken = dseth
    const quoteProvider = new ZeroExQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote({
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount,
      slippage: 0.5,
    })
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test('returns a quote for redeeming dsETH', async () => {
    const indexTokenAmount = wei(1)
    const inputToken = dseth
    const outputToken = eth
    const quoteProvider = new ZeroExQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote({
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount,
      slippage: 0.5,
    })
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })

  /**
   * Skipping tests for DPI and MVI - as they often lead to 0x API rate limits
   * because of the many components.
   */

  test.skip('returns a quote for minting DPI', async () => {
    const inputToken = eth
    const outputToken = dpi
    const request = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new ZeroExQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test.skip('returns a quote for minting MVI', async () => {
    const inputToken = eth
    const outputToken = mvi
    const request = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new ZeroExQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test.skip('returns a quote for redeeming DPI', async () => {
    const inputToken = dpi
    const outputToken = eth
    const request = {
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new ZeroExQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test.skip('returns a quote for redeeming MVI', async () => {
    const inputToken = mvi
    const outputToken = eth
    const request = {
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new ZeroExQuoteProvider(provider, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })
})
