/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { IndexCoopEthereum2xIndex } from 'constants/tokens'
import { collateralDebtSwapData, outputSwapData } from 'constants/swapdata'
import { wei } from 'utils/numbers'
import {
  LocalhostProvider,
  QuoteTokens,
  ZeroExApiArbitrumSwapQuote,
} from 'tests/utils'

import { LeveragedExtendedQuoteProvider } from './provider'

const provider = LocalhostProvider
const zeroExApi = ZeroExApiArbitrumSwapQuote

const { eth } = QuoteTokens

describe('LeveragedQuoteProvider()', () => {
  test.only('returns static swap data for ETH2X - minting', async () => {
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
})
