import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { StaticSwapQuoteProvider } from 'quote/swap/adapters/static'
import { getLocalHostProviderUrl } from 'tests/utils'
import { Exchange } from 'utils'
import { wei } from 'utils/numbers'
import { LeveragedMorphoAaveLmQuoteProvider } from './provider'

const chainId = ChainId.Base
const rpcUrl = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = new StaticSwapQuoteProvider()

const btc2x = getTokenByChainAndSymbol(chainId, 'BTC2X')
const cbBTC = getTokenByChainAndSymbol(chainId, 'cbBTC')
const eth = ETH
const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
const weth = getTokenByChainAndSymbol(chainId, 'WETH')

const taker = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

describe('LeveragedMorphoAaveLmQuoteProvider()', () => {
  test('returns quote for minting BTC2X - cbBTC', async () => {
    const request = {
      chainId,
      isMinting: true,
      inputToken: cbBTC,
      outputToken: btc2x,
      inputAmount: wei(0.015, 8).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoAaveLmQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount.gt(0)).toBe(true)
    expect(quote.outputAmount.toString()).toEqual(request.outputAmount)
    // Testing for individual params as changing quotes could affect the results
    const { swapDataDebtCollateral, swapDataInputOutputToken } = quote
    expect(swapDataDebtCollateral.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100])
    expect(swapDataDebtCollateral.path).toEqual([usdc.address, cbBTC.address])
    expect(swapDataInputOutputToken.exchange).toEqual(Exchange.None)
    expect(swapDataInputOutputToken.path).toEqual([])
    expect(swapDataInputOutputToken.tickSpacing).toEqual([])
  })

  test('returns quote for minting BTC2X - ETH', async () => {
    const request = {
      chainId,
      isMinting: true,
      inputToken: weth,
      outputToken: btc2x,
      inputAmount: wei(0.4).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoAaveLmQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount.gt(0)).toBe(true)
    expect(quote.outputAmount.toString()).toEqual(request.outputAmount)
    // Testing for individual params as changing quotes could affect the results
    const { swapDataDebtCollateral, swapDataInputOutputToken } = quote
    expect(swapDataDebtCollateral.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100])
    expect(swapDataDebtCollateral.path).toEqual([usdc.address, cbBTC.address])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([100])
    expect(swapDataInputOutputToken.path).toEqual([weth.address, cbBTC.address])
  })

  test('returns quote for minting BTC2X - USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: btc2x,
      inputAmount: wei(0.5).toString(),
      outputAmount: indexTokenAmount,
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoAaveLmQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount.gt(0)).toBe(true)
    expect(quote.outputAmount.toString()).toEqual(indexTokenAmount)
    // Testing for individual params as changing quotes could affect the results
    const { swapDataDebtCollateral, swapDataInputOutputToken } = quote
    expect(swapDataDebtCollateral.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100])
    expect(swapDataDebtCollateral.path).toEqual([usdc.address, cbBTC.address])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([100])
    expect(swapDataInputOutputToken.path).toEqual([usdc.address, cbBTC.address])
  })

  test('returns quote for redeeming BTC2X - cbBTC', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(chainId, 'BTC2X'),
      outputToken: cbBTC,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoAaveLmQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    console.log(quote)
    if (!quote) fail()
    const { swapDataDebtCollateral, swapDataInputOutputToken } = quote
    expect(quote.inputAmount.toString()).toEqual(indexTokenAmount)
    expect(quote.outputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(swapDataDebtCollateral.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100])
    expect(swapDataDebtCollateral.path).toEqual([cbBTC.address, usdc.address])
    expect(swapDataInputOutputToken.exchange).toEqual(Exchange.None)
    expect(swapDataInputOutputToken.tickSpacing).toEqual([])
    expect(swapDataInputOutputToken.path).toEqual([])
  })

  test('returns quote for redeeming BTC2X - ETH', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(chainId, 'BTC2X'),
      outputToken: weth,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoAaveLmQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    console.log(quote)
    if (!quote) fail()
    const { swapDataDebtCollateral, swapDataInputOutputToken } = quote
    expect(quote.inputAmount.toString()).toEqual(indexTokenAmount)
    expect(quote.outputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(swapDataDebtCollateral.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100])
    expect(swapDataDebtCollateral.path).toEqual([cbBTC.address, usdc.address])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([100])
    expect(swapDataInputOutputToken.path).toEqual([cbBTC.address, weth.address])
  })

  test('returns quote for redeeming BTC2X - USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(chainId, 'BTC2X'),
      outputToken: usdc,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoAaveLmQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const { swapDataDebtCollateral, swapDataInputOutputToken } = quote
    expect(quote.inputAmount.toString()).toEqual(indexTokenAmount)
    expect(quote.outputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(swapDataDebtCollateral.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100])
    expect(swapDataDebtCollateral.path).toEqual([cbBTC.address, usdc.address])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([100])
    expect(swapDataInputOutputToken.path).toEqual([cbBTC.address, usdc.address])
  })
})
