import 'dotenv/config'

import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { base } from 'viem/chains'

import { Exchange } from 'utils'
import { StaticSwapQuoteProvider } from './index'

import type { SwapQuoteV2 } from 'quote/swap/interfaces'

const chainId = base.id
const cbBTC = getTokenByChainAndSymbol(chainId, 'cbBTC').address
const ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
const USDC = getTokenByChainAndSymbol(base.id, 'USDC').address
const WETH = getTokenByChainAndSymbol(base.id, 'WETH').address

describe('StaticSwapQuoteProvider', () => {
  let quoteProvider: StaticSwapQuoteProvider

  beforeEach(() => {
    quoteProvider = new StaticSwapQuoteProvider()
  })

  test('should return swap data for WETH-cbBTC', async () => {
    const request = {
      taker: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId,
      inputToken: WETH,
      outputToken: cbBTC,
      inputAmount: '10000000000',
      slippage: 0.1,
    }
    const res = await quoteProvider.getSwapQuote(request)
    expect(res).not.toBeNull()
    const quote = res as SwapQuoteV2
    expect(quote.chainId).toBe(request.chainId)
    expect(quote.inputToken).toBe(request.inputToken)
    expect(quote.outputToken).toBe(request.outputToken)
    expect(quote.inputAmount).toBe(request.inputAmount)
    expect(quote.slippage).toBe(request.slippage)
    expect(quote.swapData).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.AerodromeSlipstream)
    expect(quote.swapData?.path).toEqual([WETH, cbBTC])
    expect(quote.swapData?.pool).toEqual(
      '0x0000000000000000000000000000000000000000',
    )
    expect(quote.swapData?.poolIds).toEqual([])
    expect(quote.swapData?.tickSpacing).toEqual([500])
  })

  test('should return swap data for USDC-cbBTC', async () => {
    const request = {
      taker: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId,
      inputToken: USDC,
      outputToken: cbBTC,
      inputAmount: '10000000000',
      slippage: 0.5,
    }
    const res = await quoteProvider.getSwapQuote(request)
    expect(res).not.toBeNull()
    const quote = res as SwapQuoteV2
    expect(quote.chainId).toBe(request.chainId)
    expect(quote.inputToken).toBe(request.inputToken)
    expect(quote.outputToken).toBe(request.outputToken)
    expect(quote.inputAmount).toBe(request.inputAmount)
    expect(quote.slippage).toBe(request.slippage)
    expect(quote.swapData).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.AerodromeSlipstream)
    expect(quote.swapData?.path).toEqual([USDC, cbBTC])
    expect(quote.swapData?.pool).toEqual(
      '0x0000000000000000000000000000000000000000',
    )
    expect(quote.swapData?.poolIds).toEqual([])
    expect(quote.swapData?.tickSpacing).toEqual([500])
  })

  test('should return swap data for cbBTC-USDC', async () => {
    const request = {
      taker: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId,
      inputToken: cbBTC,
      outputToken: USDC,
      inputAmount: '1000000000000000000',
      slippage: 0.5,
    }
    const res = await quoteProvider.getSwapQuote(request)
    expect(res).not.toBeNull()
    const quote = res as SwapQuoteV2
    expect(quote.chainId).toBe(request.chainId)
    expect(quote.inputToken).toBe(request.inputToken)
    expect(quote.outputToken).toBe(request.outputToken)
    expect(quote.inputAmount).toBe(request.inputAmount)
    expect(quote.slippage).toBe(request.slippage)
    expect(quote.swapData).not.toBeNull()
    expect(quote.swapData?.exchange).toBe(Exchange.AerodromeSlipstream)
    expect(quote.swapData?.path).toEqual([cbBTC, USDC])
    expect(quote.swapData?.pool).toEqual(
      '0x0000000000000000000000000000000000000000',
    )
    expect(quote.swapData?.poolIds).toEqual([])
    expect(quote.swapData?.tickSpacing).toEqual([500])
  })

  test('should return null for unsupported chainId', async () => {
    const request = {
      taker: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      chainId: 1,
      inputToken: ETH,
      outputToken: '0x1B5E16C5b20Fb5EE87C61fE9Afe735Cca3B21A65',
      inputAmount: '1000000000000000',
      slippage: 0.5,
    }
    const res = await quoteProvider.getSwapQuote(request)
    expect(res).toBeNull()
  })
})
