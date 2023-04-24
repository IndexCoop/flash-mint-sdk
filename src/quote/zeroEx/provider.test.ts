import 'dotenv/config'

import { DefiPulseIndex, MetaverseIndex } from 'constants/tokens'
import { LocalhostProvider, ZeroExApiSwapQuote } from 'tests/utils'
import { wei } from 'utils'
import { ZeroExQuoteProvider } from './provider'

const provider = LocalhostProvider
const zeroExApi = ZeroExApiSwapQuote

describe('ZeroExQuoteProvider', () => {
  beforeEach((): void => {
    jest.setTimeout(100000)
  })

  test('returns a quote for minting DPI', async () => {
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: DefiPulseIndex.address!,
      decimals: 18,
      symbol: DefiPulseIndex.symbol,
    }
    const request = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new ZeroExQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test('returns a quote for minting MVI', async () => {
    const inputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const outputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const request = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new ZeroExQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test('returns a quote for redeeming DPI', async () => {
    const inputToken = {
      address: DefiPulseIndex.address!,
      decimals: 18,
      symbol: DefiPulseIndex.symbol,
    }
    const outputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const request = {
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new ZeroExQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })

  test('returns a quote for redeeming MVI', async () => {
    const inputToken = {
      address: MetaverseIndex.address!,
      decimals: 18,
      symbol: MetaverseIndex.symbol,
    }
    const outputToken = {
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      symbol: 'ETH',
    }
    const request = {
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new ZeroExQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.componentQuotes.length).toBeGreaterThan(0)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  })
})
