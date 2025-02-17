import 'dotenv/config'

import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { base } from 'viem/chains'

import { ZeroExV2SwapQuoteProvider } from 'quote/swap/adapters/zeroex_v2'
import { Exchange } from 'utils'

import type { SwapQuote } from 'quote/swap/interfaces'

const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const USDC = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'

describe('ZeroExApi', () => {
  let quoteProvider: ZeroExV2SwapQuoteProvider

  beforeEach(() => {
    quoteProvider = new ZeroExV2SwapQuoteProvider(process.env.ZEROEX_API_KEY!)
  })

  test('should return quotes for mainnet', async () => {
    const request = {
      taker: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      inputToken: USDC,
      outputToken: ETH,
      inputAmount: '100000000',
      slippage: 0.1,
    }
    const res = await quoteProvider.getSwapQuote(request)
    expect(res).not.toBeNull()
    const quote = res as SwapQuote
    expect(quote.chainId).toBe(request.chainId)
    expect(quote.inputToken).toBe(request.inputToken)
    expect(quote.outputToken).toBe(request.outputToken)
    expect(quote.inputAmount).toBe(request.inputAmount)
    expect(quote.slippage).toBe(request.slippage)
    expect(quote.swapData).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.UniV3)
  })

  test('should return quotes for base', async () => {
    const request = {
      taker: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: base.id,
      inputToken: getTokenByChainAndSymbol(base.id, 'USDC').address,
      outputToken: ETH,
      inputAmount: '10000000000',
      slippage: 0.1,
    }
    const res = await quoteProvider.getSwapQuote(request)
    expect(res).not.toBeNull()
    const quote = res as SwapQuote
    expect(quote.chainId).toBe(request.chainId)
    expect(quote.inputToken).toBe(request.inputToken)
    expect(quote.outputToken).toBe(request.outputToken)
    expect(quote.inputAmount).toBe(request.inputAmount)
    expect(quote.slippage).toBe(request.slippage)
    expect(quote.swapData).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.Aerodrome)
  })

  test('should return quotes for base (cbBTC)', async () => {
    const request = {
      taker: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: base.id,
      inputToken: getTokenByChainAndSymbol(base.id, 'USDC').address,
      outputToken: getTokenByChainAndSymbol(base.id, 'cbBTC').address,
      inputAmount: '10000000000',
      slippage: 0.5,
    }
    const res = await quoteProvider.getSwapQuote(request)
    expect(res).not.toBeNull()
    const quote = res as SwapQuote
    expect(quote.chainId).toBe(request.chainId)
    expect(quote.inputToken).toBe(request.inputToken)
    expect(quote.outputToken).toBe(request.outputToken)
    expect(quote.inputAmount).toBe(request.inputAmount)
    expect(quote.slippage).toBe(request.slippage)
    expect(quote.swapData).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.Aerodrome)
  })

  test('should handle no liquidity available', async () => {
    const request = {
      taker: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      inputToken: ETH,
      outputToken: '0x1B5E16C5b20Fb5EE87C61fE9Afe735Cca3B21A65', // ic21
      inputAmount: '1000000000000000',
      slippage: 0.5,
    }
    await expect(quoteProvider.getSwapQuote(request)).rejects.toThrow(
      'Insufficient liquidity for swap',
    )
  })
})
