import { getTokenByChainAndSymbol, isAddressEqual } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { ETH } from 'constants/tokens'
import { Exchange, type SwapDataV3 } from 'utils'
import { wei } from 'utils/numbers'

import {
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
} from 'tests/utils'

import { LeveragedAerodromeQuoteProvider } from './provider'

const chainId = ChainId.Base
const rpcUrl = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)

const eth = ETH
const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
const weth = getTokenByChainAndSymbol(chainId, 'WETH')

describe.skip('LeveragedAerodromeQuoteProvider()', () => {
  test('returns quote for minting BTC2X - ETH', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: true,
      inputToken: eth,
      outputToken: getTokenByChainAndSymbol(chainId, 'BTC2X'),
      inputAmount: wei(0.5).toString(),
      outputAmount: indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedAerodromeQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount.gt(0)).toBe(true)
    expect(quote.ouputAmount.toString()).toEqual(indexTokenAmount)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    swapDataPathContains(
      [usdc.address, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'],
      quote.swapDataDebtCollateral,
    )
    swapDataPathContains(
      [weth.address, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'],
      quote.swapDataInputOutputToken,
    )
  })

  test('returns quote for minting BTC2X - USDC (ERC20)', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: true,
      inputToken: usdc,
      outputToken: getTokenByChainAndSymbol(chainId, 'BTC2X'),
      inputAmount: wei(0.5).toString(),
      outputAmount: indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedAerodromeQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.inputAmount.gt(0)).toBe(true)
    expect(quote.ouputAmount.toString()).toEqual(indexTokenAmount)
    // Testing for individual params as changing quotes could affect the results
    expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    swapDataPathContains(
      [usdc.address, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'],
      quote.swapDataDebtCollateral,
    )
    swapDataPathContains(
      [usdc.address, '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'],
      quote.swapDataInputOutputToken,
    )
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
    }
    const quoteProvider = new LeveragedAerodromeQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const { swapDataDebtCollateral, swapDataInputOutputToken } = quote
    expect(quote.inputAmount.toString()).toEqual(indexTokenAmount)
    expect(quote.ouputAmount.gt(0)).toBe(true)
    // Testing for individual params as changing quotes could affect the results
    expect(swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
    expect(swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
    swapDataPathContains(
      ['0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', usdc.address],
      swapDataDebtCollateral,
    )
    expect(swapDataInputOutputToken.exchange).not.toBe(Exchange.None)
    expect(swapDataInputOutputToken.fees.length).toBeGreaterThanOrEqual(1)
    swapDataPathContains(
      ['0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf', usdc.address],
      swapDataInputOutputToken,
    )
  })
})

function swapDataPathContains(addresses: string[], swapData: SwapDataV3) {
  const path = swapData.path
  const doesContain = addresses.every((addr) => pathContains(addr, path))
  expect(doesContain).toBe(true)
}

function pathContains(address: string, path: string[]): boolean {
  return path.some((addr) => isAddressEqual(addr, address))
}
