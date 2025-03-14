/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { ChainId } from 'constants/chains'
import { noopSwapData } from 'constants/swapdata'
import { ETH } from 'constants/tokens'
import { Exchange } from 'utils'
import { wei } from 'utils/numbers'

import {
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
} from 'tests/utils'

import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'
import { LeveragedZeroExQuoteProvider } from './provider'
const rpcUrl = getLocalHostProviderUrl(ChainId.Arbitrum)
const rpcUrlBase = getLocalHostProviderUrl(ChainId.Base)
const swapQuoteProvider = getZeroExSwapQuoteProvider(ChainId.Arbitrum)
const swapQuoteProviderBase = getZeroExSwapQuoteProvider(ChainId.Base)

const eth = ETH

function pathContains(address: string, path: string[]): boolean {
  return path.some((addr) => addr.toLowerCase() === address.toLowerCase())
}

describe.skip('LeveragedZeroExQuoteProvider()', () => {
  const indexToken = getTokenByChainAndSymbol(ChainId.Arbitrum, 'ETH2X')
  const usdc = getTokenByChainAndSymbol(ChainId.Arbitrum, 'USDC')
  const weth = getTokenByChainAndSymbol(ChainId.Arbitrum, 'WETH')

  test('returns quote for ETH2X - minting w/ ETH', async () => {
    const indexTokenAmount = wei(1)
    const request = {
      chainId: ChainId.Arbitrum,
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      inputAmount: '',
      outputAmount: indexTokenAmount.toString(),
      slippage: 0.5,
      taker: '0x0',
    }
    const quoteProvider = new LeveragedZeroExQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.outputAmount).toEqual(indexTokenAmount)
    expect(quote.inputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(pathContains(usdc.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(pathContains(weth.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
  })

  test('returns quote for ETH2X - minting w/ ERC20', async () => {
    const indexTokenAmount = wei(1)
    const request = {
      chainId: ChainId.Arbitrum,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      inputAmount: '',
      outputAmount: indexTokenAmount.toString(),
      slippage: 0.5,
      taker: '0x0',
    }
    const quoteProvider = new LeveragedZeroExQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.outputAmount).toEqual(indexTokenAmount)
    expect(quote.inputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(pathContains(usdc.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(pathContains(weth.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
  })

  test('returns quote for ETH2X - redeeming to ETH', async () => {
    const indexTokenAmount = wei(1)
    const request = {
      chainId: ChainId.Arbitrum,
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      inputAmount: indexTokenAmount.toString(),
      outputAmount: '',
      slippage: 0.5,
      taker: '0x0',
    }
    const quoteProvider = new LeveragedZeroExQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount).toEqual(indexTokenAmount)
    expect(quote.outputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(pathContains(usdc.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(pathContains(weth.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    const swapDataOutputToken = noopSwapData
    noopSwapData.path = [
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
    ]
    expect(quote.swapDataInputOutputToken).toStrictEqual(swapDataOutputToken)
  })

  test('returns quote for ETH2X - redeeming to USDC', async () => {
    const indexTokenAmount = wei(1)
    const request = {
      chainId: ChainId.Arbitrum,
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      inputAmount: indexTokenAmount.toString(),
      outputAmount: '',
      slippage: 0.5,
      taker: '0x0',
    }
    const quoteProvider = new LeveragedZeroExQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount).toEqual(indexTokenAmount)
    expect(quote.outputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(pathContains(usdc.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(pathContains(weth.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    const swapDataOutputToken = noopSwapData
    noopSwapData.path = [
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
    ]
    expect(quote.swapDataInputOutputToken).toStrictEqual(swapDataOutputToken)
  })
})

describe('LeveragedQuoteProvider() - Base', () => {
  const indexToken = getTokenByChainAndSymbol(ChainId.Base, 'ETH2X')
  const usdc = getTokenByChainAndSymbol(ChainId.Base, 'USDC')
  const weth = getTokenByChainAndSymbol(ChainId.Base, 'WETH')

  test('returns quote for ETH2X - minting w/ ETH', async () => {
    const indexTokenAmount = wei(1)
    const request = {
      chainId: ChainId.Base,
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      inputAmount: '',
      outputAmount: indexTokenAmount.toString(),
      slippage: 0.5,
      taker: '0x0',
    }
    const quoteProvider = new LeveragedZeroExQuoteProvider(
      rpcUrlBase,
      swapQuoteProviderBase,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.outputAmount).toEqual(indexTokenAmount)
    expect(quote.inputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(pathContains(usdc.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(pathContains(weth.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
  })

  test('returns quote for ETH2X - minting w/ ERC20', async () => {
    const indexTokenAmount = wei(1)
    const request = {
      chainId: ChainId.Base,
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      inputAmount: '',
      outputAmount: indexTokenAmount.toString(),
      slippage: 0.5,
      taker: '0x0',
    }
    const quoteProvider = new LeveragedZeroExQuoteProvider(
      rpcUrlBase,
      swapQuoteProviderBase,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.outputAmount).toEqual(indexTokenAmount)
    expect(quote.inputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(pathContains(usdc.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(pathContains(weth.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
  })

  test('returns quote for ETH2X - redeeming to ETH', async () => {
    const indexTokenAmount = wei(1)
    const request = {
      chainId: ChainId.Base,
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      inputAmount: indexTokenAmount.toString(),
      outputAmount: '',
      slippage: 0.5,
      taker: '0x0',
    }
    const quoteProvider = new LeveragedZeroExQuoteProvider(
      rpcUrlBase,
      swapQuoteProviderBase,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount).toEqual(indexTokenAmount)
    expect(quote.outputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(pathContains(usdc.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(pathContains(weth.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    const swapDataOutputToken = noopSwapData
    noopSwapData.path = [
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
    ]
    expect(quote.swapDataInputOutputToken).toStrictEqual(swapDataOutputToken)
  })

  test('returns quote for ETH2X - redeeming to USDC', async () => {
    const indexTokenAmount = wei(1)
    const request = {
      chainId: ChainId.Base,
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      inputAmount: indexTokenAmount.toString(),
      outputAmount: '0',
      slippage: 0.5,
      taker: '0x0',
    }
    const quoteProvider = new LeveragedZeroExQuoteProvider(
      rpcUrlBase,
      swapQuoteProviderBase,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount).toEqual(indexTokenAmount)
    expect(quote.outputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    expect(pathContains(usdc.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(pathContains(weth.address, quote.swapDataDebtCollateral.path)).toBe(
      true,
    )
    expect(quote.swapDataInputOutputToken.path).toStrictEqual([
      '0x4200000000000000000000000000000000000006',
      '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    ])
  })
})
