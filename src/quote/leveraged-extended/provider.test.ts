/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopEthereum2xIndex } from 'constants/tokens'
import {
  collateralDebtSwapData,
  noopSwapData,
  outputSwapData,
} from 'constants/swapdata'
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
  test.skip('returns quote for ETH2X - minting', async () => {
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
    expect(quote.swapDataDebtCollateral).toStrictEqual(
      collateralDebtSwapData[indexToken.symbol]
    )
    expect(quote.swapDataPaymentToken).toStrictEqual(
      outputSwapData[indexToken.symbol]['ETH']
    )
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
    expect(quote.swapDataDebtCollateral).toStrictEqual({
      exchange: 3,
      fees: [500],
      path: [
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      ],
      pool: '0x0000000000000000000000000000000000000000',
    })
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
    console.log(quote?.inputOutputTokenAmount.toString())
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.swapDataDebtCollateral).toEqual({
      exchange: 3,
      fees: [500],
      path: [
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      ],
      pool: '0x0000000000000000000000000000000000000000',
    })
    const swapDataOutputToken = noopSwapData
    noopSwapData.path = [
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
    ]
    expect(quote.swapDataPaymentToken).toStrictEqual(swapDataOutputToken)
  })
})
