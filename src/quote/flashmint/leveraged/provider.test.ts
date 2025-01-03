import { ChainId } from 'constants/chains'
import {
  collateralDebtSwapData,
  debtCollateralSwapData,
  inputSwapData,
  outputSwapData,
} from 'constants/swapdata'
import { wei } from 'utils/numbers'
import {
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
  QuoteTokens,
} from 'tests/utils'

import { LeveragedQuoteProvider } from './provider'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

const chainId = ChainId.Mainnet
const rpcUrl = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)

const { eth } = QuoteTokens
const iceth = getTokenByChainAndSymbol(chainId, 'icETH')

describe('LeveragedQuoteProvider()', () => {
  test('returns static swap data for 🧊ETH - minting', async () => {
    const indexToken = iceth
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedQuoteProvider(rpcUrl, swapQuoteProvider)
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
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedQuoteProvider(rpcUrl, swapQuoteProvider)
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
