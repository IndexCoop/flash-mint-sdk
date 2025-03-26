import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import {
  getLocalHostProviderUrl,
  getZeroExV2SwapQuoteProvider,
} from 'tests/utils'
import { wei } from 'utils'

import { ZeroExQuoteProvider } from './provider'

const chainId = ChainId.Mainnet
const rpcUrl = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = getZeroExV2SwapQuoteProvider()

// Skipped for CI as it might create rate limits with 0x otherwise
describe.skip('ZeroExQuoteProvider', () => {
  const dpi = getTokenByChainAndSymbol(chainId, 'DPI')
  const mvi = getTokenByChainAndSymbol(chainId, 'MVI')

  test('returns a quote for redeeming DPI', async () => {
    const inputToken = dpi
    const outputToken = ETH
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

  test('returns a quote for redeeming MVI', async () => {
    const inputToken = mvi
    const outputToken = ETH
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
