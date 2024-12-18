/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressZero, EthAddress } from 'constants/addresses'
import { ChainId } from 'constants/chains'
import { noopSwapData } from 'constants/swapdata'
import { USDC, WETH } from 'constants/tokens'
import { wei } from 'utils/numbers'
import { Exchange } from 'utils'

import {
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
  QuoteTokens,
} from 'tests/utils'

import { FlashMintHyEthQuoteProvider } from './provider'

const rpcUrl = getLocalHostProviderUrl(ChainId.Mainnet)
const swapQuoteProvider = getZeroExSwapQuoteProvider(ChainId.Mainnet)

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
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider
    )
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
    ]
    expect(quote.componentsSwapData).toStrictEqual(componentSwapDataIssue)
    expect(quote.swapDataEthToInputOutputToken).toBeNull()
    expect(quote.swapDataInputTokenToEth).toBeNull()
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
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider
    )
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
      // {
      //   exchange: Exchange.UniV3,
      //   fees: [500],
      //   path: [WETH.address, USDC.address],
      //   pool: AddressZero,
      // },
    ]
    expect(quote.componentsSwapData).toStrictEqual(componentSwapDataIssue)
    const swapDataInputTokenToEth = {
      path: [weth.address, EthAddress],
      fees: [],
      pool: AddressZero,
      exchange: Exchange.None,
    }
    expect(quote.swapDataInputTokenToEth).toStrictEqual(swapDataInputTokenToEth)
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
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider
    )
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
      // {
      //   exchange: Exchange.UniV3,
      //   fees: [500],
      //   path: [WETH.address, USDC.address],
      //   pool: AddressZero,
      // },
    ]
    expect(quote.componentsSwapData).toStrictEqual(componentSwapDataIssue)
    const swapDataInputTokenToEth = {
      path: [USDC.address, WETH.address],
      fees: [500],
      pool: AddressZero,
      exchange: Exchange.UniV3,
    }
    expect(quote.swapDataInputTokenToEth).toStrictEqual(swapDataInputTokenToEth)
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
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider
    )
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
      // {
      //   exchange: Exchange.UniV3,
      //   fees: [500],
      //   path: [USDC.address, WETH.address],
      //   pool: AddressZero,
      // },
    ]
    expect(quote.componentsSwapData).toStrictEqual(componentSwapDataRedeem)
    expect(quote.swapDataEthToInputOutputToken).toBeNull()
    expect(quote.swapDataInputTokenToEth).toBeNull()
  })

  test('returns a quote for redeeming to ERC-20', async () => {
    const request = {
      isMinting: false,
      inputToken: {
        symbol: indexToken.symbol,
        decimals: 18,
        address: indexToken.address!,
      },
      outputToken: usdc,
      indexTokenAmount: wei(1).toBigInt(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider
    )
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
      // {
      //   exchange: Exchange.UniV3,
      //   fees: [500],
      //   path: [USDC.address, WETH.address],
      //   pool: AddressZero,
      // },
    ]
    expect(quote.componentsSwapData).toStrictEqual(componentSwapDataRedeem)
    expect(quote.swapDataInputTokenToEth).toBeNull()
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
})
