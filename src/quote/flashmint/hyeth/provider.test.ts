/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressZero, EthAddress } from 'constants/addresses'
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

// const rpcUrl = LocalhostProviderUrl
// const swapQuoteProvider = IndexZeroExSwapQuoteProvider

const { eth, hyeth, usdc, weth } = QuoteTokens
const indexToken = hyeth

describe('FlashMintHyEthQuoteProvider()', () => {
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
    expect(quote.swapDataEthToInputOutputToken).toBeNull()
  })

  test('returns a quote for minting w/ WETH', async () => {
    const request = {
      isMinting: true,
      inputToken: weth,
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
    const swapDataEthToInputToken = {
      path: [EthAddress, weth.address],
      fees: [],
      pool: AddressZero,
      exchange: Exchange.None,
    }
    expect(quote.swapDataEthToInputOutputToken).toStrictEqual(
      swapDataEthToInputToken
    )
  })

  test('returns a quote for minting w/ USDC', async () => {
    const request = {
      isMinting: true,
      inputToken: usdc,
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
    const swapDataEthToInputToken = {
      path: [WETH.address, USDC.address],
      fees: [500],
      pool: AddressZero,
      exchange: Exchange.UniV3,
    }
    expect(quote.swapDataEthToInputOutputToken).toStrictEqual(
      swapDataEthToInputToken
    )
  })

  //   test('returns a quote for minting w/ ERC20', async () => {
  test('returns a quote for redeeming to ETH', async () => {
    const request = {
      isMinting: false,
      inputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.address!,
      },
      outputToken: eth,
      indexTokenAmount: wei(1).toBigInt(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintHyEthQuoteProvider()
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount > 0).toBe(true)
    const componentSwapDataRedeem = [
      noopSwapData,
      noopSwapData,
      noopSwapData,
      noopSwapData,
      noopSwapData,
      {
        exchange: Exchange.UniV3,
        fees: [500],
        path: [USDC.address, WETH.address],
        pool: AddressZero,
      },
    ]
    expect(quote.componentsSwapData).toStrictEqual(componentSwapDataRedeem)
  })
})
