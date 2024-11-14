import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import {
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
} from 'tests/utils'
import { wei } from 'utils/numbers'

import { FlashMintWrappedQuoteRequest, WrappedQuoteProvider } from '.'

const chainId = ChainId.Base
const indexToken = getTokenByChainAndSymbol(chainId, 'icUSD')
const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
const weth = getTokenByChainAndSymbol(chainId, 'WETH')
const provider = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)

describe('WrappedQuoteProvider()', () => {
  test('returns a quote for minting icUSD w/ USDC', async () => {
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
    expect(quote.componentSwapData.length).toEqual(5)
    expect(quote.componentWrapData.length).toEqual(5)
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
    expect(quote.componentSwapData.length).toEqual(5)
    expect(quote.componentWrapData.length).toEqual(5)
  })

  test('returns a quote redeeming icUSD for USDC', async () => {
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
    expect(quote.inputOutputTokenAmount.gt(0)).toEqual(true)
    expect(quote.componentSwapData.length).toEqual(5)
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
    expect(quote.componentSwapData.length).toEqual(5)
    expect(quote.componentWrapData.length).toEqual(5)
  })
})
