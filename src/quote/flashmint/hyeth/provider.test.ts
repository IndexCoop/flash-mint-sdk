/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressZero } from 'constants/addresses'
import { noopSwapData } from 'constants/swapdata'
import { USDC, WETH } from 'constants/tokens'
import { wei } from 'utils/numbers'
import { Exchange } from 'utils'

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
  test('returns a quote for minting w/ ETH', async () => {
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
    const componentSwapDataIssue = [
      noopSwapData,
      noopSwapData,
      noopSwapData,
      noopSwapData,
      noopSwapData,
      {
        exchange: Exchange.UniV3,
        fees: [500],
        path: [WETH.address, USDC.address],
        pool: AddressZero,
      },
    ]
    expect(quote.componentsSwapData).toStrictEqual(componentSwapDataIssue)
    // expect(quote.swapDataPaymentToken).toStrictEqual(
    //   inputSwapData[indexToken.symbol]['ETH']
    // )
  })
})
