import {
  collateralDebtSwapData,
  debtCollateralSwapData,
  inputSwapData,
  outputSwapData,
} from 'constants/swapdata'
import {
  BTC2xFlexibleLeverageIndex,
  ETH,
  ETH2xFlexibleLeverageIndex,
  InterestCompoundingETHIndex,
} from 'constants/tokens'
import { wei } from 'utils/numbers'
import { LocalhostProvider, ZeroExApiSwapQuote } from 'tests/utils'
import { LeveragedQuoteProvider } from './provider'

const zeroExApi = ZeroExApiSwapQuote
const provider = LocalhostProvider

describe('getFlashMintLeveragedQuote()', () => {
  test('returns static swap data for 🧊ETH - minting', async () => {
    const indexToken = InterestCompoundingETHIndex
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: true,
      inputToken: { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
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
    const indexToken = InterestCompoundingETHIndex
    const indexTokenAmount = wei(1)
    const request = {
      isMinting: false,
      inputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.address!,
      },
      outputToken: { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
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
    const indexToken = BTC2xFlexibleLeverageIndex
    const indexTokenAmount = wei('1')
    const request = {
      isMinting: true,
      inputToken: { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
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
    expect(quote.swapDataPaymentToken).toBeDefined()
  })

  test('returns a quote for ETH2xFLI', async () => {
    const indexToken = ETH2xFlexibleLeverageIndex
    const indexTokenAmount = wei('1')
    const request = {
      isMinting: true,
      inputToken: { symbol: ETH.symbol, decimals: 18, address: ETH.address! },
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
    expect(quote.swapDataPaymentToken).toBeDefined()
  })
})
