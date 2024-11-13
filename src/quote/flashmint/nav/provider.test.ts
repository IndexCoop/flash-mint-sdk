import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { AddressZero } from 'constants/addresses'
import {
  IndexZeroExSwapQuoteProvider,
  LocalhostProviderUrl,
  QuoteTokens,
} from 'tests/utils'
import { wei } from 'utils/numbers'
import { Exchange, isSameAddress } from 'utils'

import { FlashMintNavQuoteRequest, FlashMintNavQuoteProvider } from './provider'

describe('FlashMintNavQuoteProvider()', () => {
  const { usdc, weth } = QuoteTokens
  const chainId = 1
  const indexToken = getTokenByChainAndSymbol(chainId, 'icUSD')
  const provider = LocalhostProviderUrl
  const swapQuoteProvider = IndexZeroExSwapQuoteProvider

  test('returns a quote for minting icUSD', async () => {
    const request: FlashMintNavQuoteRequest = {
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      inputTokenAmount: wei(100, 6),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintNavQuoteProvider(
      provider,
      swapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputTokenAmount).toEqual(request.inputTokenAmount)
    expect(quote.outputTokenAmount.gt(0)).toEqual(true)
    expect(quote.reserveAssetSwapData).toEqual({
      exchange: Exchange.None,
      fees: [],
      path: [],
      poolIds: [],
      pool: AddressZero,
    })
  })

  test('returns a quote for minting icUSD w/ WETH', async () => {
    const request: FlashMintNavQuoteRequest = {
      chainId,
      isMinting: true,
      inputToken: weth,
      outputToken: indexToken,
      inputTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintNavQuoteProvider(
      provider,
      swapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputTokenAmount).toEqual(request.inputTokenAmount)
    expect(quote.outputTokenAmount.gt(0)).toEqual(true)
    // Testing for individual params as changing market conditions could affect
    // the swap data contents and the test results
    const { reserveAssetSwapData } = quote
    expect(reserveAssetSwapData.exchange).not.toBe(Exchange.None)
    expect(reserveAssetSwapData.fees.length).toBeGreaterThanOrEqual(1)
    expect(isSameAddress(reserveAssetSwapData.path[0], weth.address)).toBe(true)
    expect(
      isSameAddress(
        reserveAssetSwapData.path[reserveAssetSwapData.path.length - 1],
        usdc.address
      )
    ).toBe(true)
    expect(reserveAssetSwapData.poolIds).toEqual([])
  })

  test('returns a quote redeeming icUSD for USDC', async () => {
    const request: FlashMintNavQuoteRequest = {
      chainId,
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      inputTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintNavQuoteProvider(
      provider,
      swapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputTokenAmount).toEqual(request.inputTokenAmount)
    expect(quote.outputTokenAmount.gt(0)).toEqual(true)
    expect(quote.reserveAssetSwapData).toEqual({
      exchange: Exchange.None,
      fees: [],
      path: [],
      poolIds: [],
      pool: AddressZero,
    })
  })

  test('returns a quote for redeeming icUSD for WETH', async () => {
    const request: FlashMintNavQuoteRequest = {
      chainId,
      isMinting: false,
      inputToken: indexToken,
      outputToken: weth,
      inputTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintNavQuoteProvider(
      provider,
      swapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputTokenAmount).toEqual(request.inputTokenAmount)
    expect(quote.outputTokenAmount.gt(0)).toEqual(true)
    // Testing for individual params as changing market conditions could affect
    // the swap data contents and the test results
    const { reserveAssetSwapData } = quote
    expect(reserveAssetSwapData.exchange).not.toBe(Exchange.None)
    expect(reserveAssetSwapData.fees.length).toBeGreaterThanOrEqual(1)
    expect(isSameAddress(reserveAssetSwapData.path[0], usdc.address)).toBe(true)
    expect(
      isSameAddress(
        reserveAssetSwapData.path[reserveAssetSwapData.path.length - 1],
        weth.address
      )
    ).toBe(true)
    expect(reserveAssetSwapData.poolIds).toEqual([])
  })
})
