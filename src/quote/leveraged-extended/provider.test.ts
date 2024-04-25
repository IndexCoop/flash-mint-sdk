/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopEthereum2xIndex } from 'constants/tokens'
import { noopSwapData } from 'constants/swapdata'
import { Exchange } from 'utils'
import { wei } from 'utils/numbers'
import {
  LocalhostProviderArbitrum,
  QuoteTokens,
  ZeroExApiArbitrumSwapQuote,
} from 'tests/utils'

import { LeveragedExtendedQuoteProvider } from './provider'

const provider = LocalhostProviderArbitrum
const zeroExApi = ZeroExApiArbitrumSwapQuote

const { eth, usdc } = QuoteTokens

describe('LeveragedQuoteProvider()', () => {
  test('returns quote for ETH2X - minting w/ ETH', async () => {
    const indexToken = IndexCoopEthereum2xIndex
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: true,
      inputToken: eth,
      outputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.addressArbitrum!,
      },
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedExtendedQuoteProvider(
      provider,
      zeroExApi
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(
      quote.swapDataDebtCollateral.path.some(
        (address) => address === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
      )
    ).toBe(true)
    expect(
      quote.swapDataDebtCollateral.path.some(
        (address) => address === '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
      )
    ).toBe(true)
  })

  test('returns quote for ETH2X - minting w/ ERC20', async () => {
    const indexToken = IndexCoopEthereum2xIndex
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: true,
      inputToken: usdc,
      outputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.addressArbitrum!,
      },
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedExtendedQuoteProvider(
      provider,
      zeroExApi
    )
    const quote = await quoteProvider.getQuote(request)
    console.log(quote?.indexTokenAmount.toString())
    console.log(quote?.inputOutputTokenAmount.toString())
    console.log(quote?.swapDataPaymentToken)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(
      quote.swapDataDebtCollateral.path.some(
        (address) => address === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
      )
    ).toBe(true)
    expect(
      quote.swapDataDebtCollateral.path.some(
        (address) => address === '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
      )
    ).toBe(true)
  })

  test('returns quote for ETH2X - redeeming to ETH', async () => {
    const indexToken = IndexCoopEthereum2xIndex
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: false,
      inputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.addressArbitrum!,
      },
      outputToken: eth,
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedExtendedQuoteProvider(
      provider,
      zeroExApi
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(
      quote.swapDataDebtCollateral.path.some(
        (address) => address === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
      )
    ).toBe(true)
    expect(
      quote.swapDataDebtCollateral.path.some(
        (address) => address === '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
      )
    ).toBe(true)
    const swapDataOutputToken = noopSwapData
    noopSwapData.path = [
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
    ]
    expect(quote.swapDataPaymentToken).toStrictEqual(swapDataOutputToken)
  })

  test('returns quote for ETH2X - redeeming to USDC', async () => {
    const indexToken = IndexCoopEthereum2xIndex
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: false,
      inputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.addressArbitrum!,
      },
      outputToken: usdc,
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedExtendedQuoteProvider(
      provider,
      zeroExApi
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(
      quote.swapDataDebtCollateral.path.some(
        (address) => address === '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
      )
    ).toBe(true)
    expect(
      quote.swapDataDebtCollateral.path.some(
        (address) => address === '0xaf88d065e77c8cc2239327c5edb3a432268e5831'
      )
    ).toBe(true)
    const swapDataOutputToken = noopSwapData
    noopSwapData.path = [
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
    ]
    expect(quote.swapDataPaymentToken).toStrictEqual(swapDataOutputToken)
  })
})
