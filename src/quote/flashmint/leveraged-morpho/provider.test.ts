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
const uSui = getTokenByChainAndSymbol(chainId, 'uSUI')
const uSui2x = getTokenByChainAndSymbol(chainId, 'uSUI2x')
const weth = getTokenByChainAndSymbol(chainId, 'WETH')
// const wstEth15x = getTokenByChainAndSymbol(chainId, 'wstETH15x')

const taker = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

describe('LeveragedMorphoQuoteProvider()', () => {
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
