/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import {
  collateralDebtSwapData,
  debtCollateralSwapData,
  inputSwapData,
  outputSwapData,
} from 'constants/swapdata'
import { wei } from 'utils/numbers'
import { LocalhostProvider, QuoteTokens, ZeroExApiSwapQuote } from 'tests/utils'

import { LeveragedQuoteProvider } from './provider'

const provider = LocalhostProvider
const zeroExApi = ZeroExApiSwapQuote

const { btc2xfli, eth, eth2xfli, iceth } = QuoteTokens

describe('LeveragedQuoteProvider()', () => {
  test('returns static swap data for 🧊ETH - minting', async () => {
    const indexToken = iceth
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: true,
      inputToken: eth,
      outputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.address!,
      },
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.swapDataDebtCollateral).toStrictEqual(
      debtCollateralSwapData[indexToken.symbol]
    )
    expect(quote.swapDataPaymentToken).toStrictEqual(
      inputSwapData[indexToken.symbol]['ETH']
    )
  })

  test('returns static swap data for 🧊ETH - redeeming', async () => {
    const indexToken = iceth
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: false,
      inputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.address!,
      },
      outputToken: eth,
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.swapDataDebtCollateral).toStrictEqual(
      collateralDebtSwapData[indexToken.symbol]
    )
    expect(quote.swapDataPaymentToken).toStrictEqual(
      outputSwapData[indexToken.symbol]['ETH']
    )
  })

  test('returns a quote for BTC2xFLI', async () => {
    const indexToken = btc2xfli
    const indexTokenAmount = wei('1')
    const request = {
      isMinting: true,
      inputToken: eth,
      outputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.address!,
      },
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataDebtCollateral.path.length).toBeGreaterThan(0)
    expect(quote.swapDataPaymentToken).toBeDefined()
    expect(quote.swapDataPaymentToken.path.length).toBeGreaterThan(0)
  })

  test('returns a quote for ETH2xFLI', async () => {
    const indexToken = eth2xfli
    const indexTokenAmount = wei('1')
    const request = {
      isMinting: true,
      inputToken: eth,
      outputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.address!,
      },
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataDebtCollateral.path.length).toBeGreaterThan(0)
    expect(quote.swapDataPaymentToken).toBeDefined()
    expect(quote.swapDataPaymentToken.exchange).toEqual(0)
    expect(quote.swapDataPaymentToken.fees.length).toEqual(0)
    expect(quote.swapDataPaymentToken.path.length).toEqual(0)
    expect(quote.swapDataPaymentToken.pool).toEqual(
      '0x0000000000000000000000000000000000000000'
    )
  })
})
