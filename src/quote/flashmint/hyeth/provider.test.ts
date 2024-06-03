import { wei } from 'utils/numbers'

import {
  IndexZeroExSwapQuoteProvider,
  LocalhostProviderUrl,
  QuoteTokens,
} from 'tests/utils'

import { FlashMintHyEthQuoteProvider } from './provider'

const rpcUrl = LocalhostProviderUrl
const swapQuoteProvider = IndexZeroExSwapQuoteProvider

const { eth, hyeth } = QuoteTokens
const indexToken = hyeth

describe('LeveragedQuoteProvider()', () => {
  test('returns a quote for minting', async () => {
    const request = {
      isMinting: true,
      inputToken: eth,
      outputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.address!,
      },
      indexTokenAmount: wei(1).toBigInt(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintHyEthQuoteProvider()
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount > 0).toBe(true)
    // expect(quote.swapDataDebtCollateral).toStrictEqual(
    //   debtCollateralSwapData[indexToken.symbol]
    // )
    // expect(quote.swapDataPaymentToken).toStrictEqual(
    //   inputSwapData[indexToken.symbol]['ETH']
    // )
  })
})
