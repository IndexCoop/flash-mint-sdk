import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { StaticSwapQuoteProvider } from 'quote/swap/adapters/static'
import { getLocalHostProviderUrl } from 'tests/utils'
import { Exchange } from 'utils'
import { wei } from 'utils/numbers'
import { LeveragedMorphoQuoteProvider } from './provider'

const chainId = ChainId.Base
const rpcUrl = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = new StaticSwapQuoteProvider()

const eth = ETH
const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
const usSol = getTokenByChainAndSymbol(chainId, 'uSOL')
const usSol2x = getTokenByChainAndSymbol(chainId, 'uSOL2x')
const uSui = getTokenByChainAndSymbol(chainId, 'uSUI')
const uSui2x = getTokenByChainAndSymbol(chainId, 'uSUI2x')
const weth = getTokenByChainAndSymbol(chainId, 'WETH')
const wstEth = getTokenByChainAndSymbol(chainId, 'wstETH')
const wstEth15x = getTokenByChainAndSymbol(chainId, 'wstETH15x')

const taker = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

describe('LeveragedMorphoQuoteProvider() - uSUI2x', () => {
  test('returns quote for minting uSUI2x - ETH', async () => {
    const request = {
      chainId,
      isMinting: true,
      inputToken: eth,
      outputToken: uSui2x,
      inputAmount: wei(0.5).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100, 200])
    expect(swapDataDebtCollateral.path).toEqual([
      usdc.address,
      weth.address,
      uSui.address,
    ])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.path).toEqual([weth.address, uSui.address])
    expect(swapDataInputOutputToken.tickSpacing).toEqual([200])
  })

  test('returns quote for minting uSUI2x - USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: uSui2x,
      inputAmount: wei(0.5).toString(),
      outputAmount: indexTokenAmount,
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100, 200])
    expect(swapDataDebtCollateral.path).toEqual([
      usdc.address,
      weth.address,
      uSui.address,
    ])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.path).toEqual([
      usdc.address,
      weth.address,
      uSui.address,
    ])
    expect(swapDataInputOutputToken.tickSpacing).toEqual([100, 200])
  })

  test('returns quote for redeeming uSUI2x - ETH', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: uSui2x,
      outputToken: weth,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([200, 100])
    expect(swapDataDebtCollateral.path).toEqual([
      uSui.address,
      weth.address,
      usdc.address,
    ])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([200])
    expect(swapDataInputOutputToken.path).toEqual([uSui.address, weth.address])
  })

  test('returns quote for redeeming uSUI2x - USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: uSui2x,
      outputToken: usdc,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([200, 100])
    expect(swapDataDebtCollateral.path).toEqual([
      uSui.address,
      weth.address,
      usdc.address,
    ])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([200, 100])
    expect(swapDataInputOutputToken.path).toEqual([
      uSui.address,
      weth.address,
      usdc.address,
    ])
  })
})

describe('LeveragedMorphoQuoteProvider() - uSOL2x', () => {
  test('returns quote for minting with ETH', async () => {
    const request = {
      chainId,
      isMinting: true,
      inputToken: eth,
      outputToken: usSol2x,
      inputAmount: wei(0.5).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100, 200])
    expect(swapDataDebtCollateral.path).toEqual([
      usdc.address,
      weth.address,
      usSol.address,
    ])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.path).toEqual([weth.address, usSol.address])
    expect(swapDataInputOutputToken.tickSpacing).toEqual([200])
  })

  test('returns quote for minting with USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: usSol2x,
      inputAmount: wei(0.5).toString(),
      outputAmount: indexTokenAmount,
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([100, 200])
    expect(swapDataDebtCollateral.path).toEqual([
      usdc.address,
      weth.address,
      usSol.address,
    ])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.path).toEqual([
      usdc.address,
      weth.address,
      usSol.address,
    ])
    expect(swapDataInputOutputToken.tickSpacing).toEqual([100, 200])
  })

  test('returns quote for redeeming to ETH', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: usSol2x,
      outputToken: weth,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([200, 100])
    expect(swapDataDebtCollateral.path).toEqual([
      usSol.address,
      weth.address,
      usdc.address,
    ])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([200])
    expect(swapDataInputOutputToken.path).toEqual([usSol.address, weth.address])
  })

  test('returns quote for redeeming to USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: usSol2x,
      outputToken: usdc,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([200, 100])
    expect(swapDataDebtCollateral.path).toEqual([
      usSol.address,
      weth.address,
      usdc.address,
    ])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([200, 100])
    expect(swapDataInputOutputToken.path).toEqual([
      usSol.address,
      weth.address,
      usdc.address,
    ])
  })
})

describe('LeveragedMorphoQuoteProvider() - wstETH15x', () => {
  test('returns quote for minting with ETH', async () => {
    const request = {
      chainId,
      isMinting: true,
      inputToken: eth,
      outputToken: wstEth15x,
      inputAmount: wei(0.5).toString(),
      outputAmount: wei(1).toString(),
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([1])
    expect(swapDataDebtCollateral.path).toEqual([weth.address, wstEth.address])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.path).toEqual([
      weth.address,
      wstEth.address,
    ])
    expect(swapDataInputOutputToken.tickSpacing).toEqual([1])
  })

  test('returns quote for minting with USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: wstEth15x,
      inputAmount: wei(0.5).toString(),
      outputAmount: indexTokenAmount,
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([1])
    expect(swapDataDebtCollateral.path).toEqual([weth.address, wstEth.address])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.path).toEqual([
      usdc.address,
      weth.address,
      wstEth.address,
    ])
    expect(swapDataInputOutputToken.tickSpacing).toEqual([100, 1])
  })

  test('returns quote for redeeming to ETH', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: wstEth15x,
      outputToken: weth,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([1])
    expect(swapDataDebtCollateral.path).toEqual([wstEth.address, weth.address])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([1])
    expect(swapDataInputOutputToken.path).toEqual([
      wstEth.address,
      weth.address,
    ])
  })

  test('returns quote for redeeming to USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: false,
      inputToken: wstEth15x,
      outputToken: usdc,
      inputAmount: indexTokenAmount,
      outputAmount: wei(0.5).toString(), // not used for redeeming
      slippage: 0.5,
      taker,
    }
    const quoteProvider = new LeveragedMorphoQuoteProvider(
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
    expect(swapDataDebtCollateral.tickSpacing).toEqual([1])
    expect(swapDataDebtCollateral.path).toEqual([wstEth.address, weth.address])
    expect(swapDataInputOutputToken.exchange).toEqual(
      Exchange.AerodromeSlipstream,
    )
    expect(swapDataInputOutputToken.tickSpacing).toEqual([1, 100])
    expect(swapDataInputOutputToken.path).toEqual([
      wstEth.address,
      weth.address,
      usdc.address,
    ])
  })
})
