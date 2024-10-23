import { AddressZero } from 'constants/addresses'
import {
  IndexZeroExSwapQuoteProvider,
  LocalhostProviderUrl,
  QuoteTokens,
} from 'tests/utils'
import { wei } from 'utils/numbers'
import { FlashMintNavQuoteRequest, FlashMintNavQuoteProvider } from './provider'
import { Exchange } from 'utils'

describe('FlashMintNavQuoteProvider()', () => {
  const { icusd, usdc, weth } = QuoteTokens
  const indexToken = icusd
  const chainId = 1
  const provider = LocalhostProviderUrl
  const swapQuoteProvider = IndexZeroExSwapQuoteProvider

  test('returns a quote for minting icUSD', async () => {
    const request: FlashMintNavQuoteRequest = {
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: icusd,
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
      outputToken: icusd,
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
    // TODO:
    expect(quote.reserveAssetSwapData).toBeDefined()
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
    // TODO:
    expect(quote.reserveAssetSwapData).toBeDefined()
  })
})
