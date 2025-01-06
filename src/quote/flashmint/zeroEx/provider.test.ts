import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import {
  QuoteTokens,
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
} from 'tests/utils'
import { wei } from 'utils'

import { ZeroExQuoteProvider } from './provider'

const chainId = ChainId.Mainnet
const rpcUrl = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)

describe('ZeroExQuoteProvider', () => {
  const dpi = getTokenByChainAndSymbol(chainId, 'DPI')
  const { eth } = QuoteTokens
  const mvi = getTokenByChainAndSymbol(chainId, 'MVI')

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
    const quoteProvider = new ZeroExQuoteProvider(rpcUrl, swapQuoteProvider)
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
    const quoteProvider = new ZeroExQuoteProvider(rpcUrl, swapQuoteProvider)
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
    const quoteProvider = new ZeroExQuoteProvider(rpcUrl, swapQuoteProvider)
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
    const quoteProvider = new ZeroExQuoteProvider(rpcUrl, swapQuoteProvider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })
})
