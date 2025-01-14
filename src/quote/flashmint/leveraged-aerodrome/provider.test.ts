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

describe('LeveragedAerodromeQuoteProvider()', () => {
  test('returns quote for minting BTC2X - ETH', async () => {
    const indexTokenAmount = wei(1).toString()
    const request = {
      chainId,
      isMinting: true,
      inputToken: eth,
      outputToken: getTokenByChainAndSymbol(chainId, 'BTC2X'),
      inputAmount: wei(1).toString(),
      outputAmount: indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new LeveragedAerodromeQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    console.log(quote)
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

  //   test('returns quote for ETH2X - minting w/ ERC20', async () => {
  //     const indexToken = IndexCoopEthereum2xIndex
  //     const indexTokenAmount = wei(1)
  //     const request = {
  //       isMinting: true,
  //       inputToken: usdc,
  //       outputToken: {
  //         symbol: indexToken.symbol,
  //         decimals: 18,
  //         address: indexToken.addressArbitrum!,
  //       },
  //       indexTokenAmount,
  //       slippage: 0.5,
  //     }
  //     const quoteProvider = new LeveragedAerodromeQuoteProvider(
  //       rpcUrl,
  //       swapQuoteProvider,
  //     )
  //     const quote = await quoteProvider.getQuote(request)
  //     if (!quote) fail()
  //     expect(quote.outputTokenAmount).toEqual(indexTokenAmount)
  //     expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  //     // Testing for individual params as changing quotes could affect the results
  //     expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
  //     expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
  //     expect(
  //       pathContains(USDC.addressArbitrum!, quote.swapDataDebtCollateral.path),
  //     ).toBe(true)
  //     expect(
  //       pathContains(WETH.addressArbitrum!, quote.swapDataDebtCollateral.path),
  //     ).toBe(true)
  //   })

  //   test('returns quote for ETH2X - redeeming to ETH', async () => {
  //     const indexToken = IndexCoopEthereum2xIndex
  //     const indexTokenAmount = wei(1)
  //     const request = {
  //       isMinting: false,
  //       inputToken: {
  //         symbol: indexToken.symbol,
  //         decimals: 18,
  //         address: indexToken.addressArbitrum!,
  //       },
  //       outputToken: eth,
  //       indexTokenAmount,
  //       slippage: 0.5,
  //     }
  //     const quoteProvider = new LeveragedAerodromeQuoteProvider(
  //       rpcUrl,
  //       swapQuoteProvider,
  //     )
  //     const quote = await quoteProvider.getQuote(request)
  //     if (!quote) fail()
  //     expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
  //     expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  //     // Testing for individual params as changing quotes could affect the results
  //     expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
  //     expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
  //     expect(
  //       pathContains(USDC.addressArbitrum!, quote.swapDataDebtCollateral.path),
  //     ).toBe(true)
  //     expect(
  //       pathContains(WETH.addressArbitrum!, quote.swapDataDebtCollateral.path),
  //     ).toBe(true)
  //     const swapDataOutputToken = noopSwapData
  //     noopSwapData.path = [
  //       '0x0000000000000000000000000000000000000000',
  //       '0x0000000000000000000000000000000000000000',
  //     ]
  //     expect(quote.swapDataPaymentToken).toStrictEqual(swapDataOutputToken)
  //   })

  //   test('returns quote for ETH2X - redeeming to USDC', async () => {
  //     const indexToken = IndexCoopEthereum2xIndex
  //     const indexTokenAmount = wei(1)
  //     const request = {
  //       isMinting: false,
  //       inputToken: {
  //         symbol: indexToken.symbol,
  //         decimals: 18,
  //         address: indexToken.addressArbitrum!,
  //       },
  //       outputToken: usdc,
  //       indexTokenAmount,
  //       slippage: 0.5,
  //     }
  //     const quoteProvider = new LeveragedAerodromeQuoteProvider(
  //       rpcUrl,
  //       swapQuoteProvider,
  //     )
  //     const quote = await quoteProvider.getQuote(request)
  //     if (!quote) fail()
  //     expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
  //     expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
  //     // Testing for individual params as changing quotes could affect the results
  //     expect(quote.swapDataDebtCollateral.exchange).not.toBe(Exchange.None)
  //     expect(quote.swapDataDebtCollateral.fees.length).toBeGreaterThanOrEqual(1)
  //     expect(
  //       pathContains(USDC.addressArbitrum!, quote.swapDataDebtCollateral.path),
  //     ).toBe(true)
  //     expect(
  //       pathContains(WETH.addressArbitrum!, quote.swapDataDebtCollateral.path),
  //     ).toBe(true)
  //     const swapDataOutputToken = noopSwapData
  //     noopSwapData.path = [
  //       '0x0000000000000000000000000000000000000000',
  //       '0x0000000000000000000000000000000000000000',
  //     ]
  //     expect(quote.swapDataPaymentToken).toStrictEqual(swapDataOutputToken)
  //   })
})

function swapDataPathContains(addresses: string[], swapData: SwapDataV3) {
  const path = swapData.path
  const doesContain = addresses.every((addr) => pathContains(addr, path))
  expect(doesContain).toBe(true)
}

function pathContains(address: string, path: string[]): boolean {
  return path.some((addr) => isAddressEqual(addr, address))
}
