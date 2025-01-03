import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressZero, EthAddress } from 'constants/addresses'
import { ChainId } from 'constants/chains'
import { noopSwapData } from 'constants/swapdata'
import { USDC, WETH } from 'constants/tokens'
import { Exchange } from 'utils'
import { wei } from 'utils/numbers'

import {
  QuoteTokens,
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
} from 'tests/utils'

import { FlashMintHyEthQuoteProvider } from './provider'

const chainId = ChainId.Mainnet
const rpcUrl = getLocalHostProviderUrl(chainId)
const swapQuoteProvider = getZeroExSwapQuoteProvider(chainId)

describe('FlashMintHyEthQuoteProvider()', () => {
  const { eth } = QuoteTokens
  const hyeth = getTokenByChainAndSymbol(chainId, 'hyETH')
  const indexToken = hyeth
  const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
  const weth = getTokenByChainAndSymbol(chainId, 'WETH')
  test('returns a quote for minting w/ ETH', async () => {
    const request = {
      isMinting: true,
      inputToken: eth,
      outputToken: indexToken,
      indexTokenAmount: wei(1).toBigInt(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount > 0).toBe(true)
    const componentSwapDataIssue = [noopSwapData, noopSwapData]
    expect(quote.componentsSwapData).toStrictEqual(componentSwapDataIssue)
    expect(quote.swapDataEthToInputOutputToken).toBeNull()
    expect(quote.swapDataInputTokenToEth).toBeNull()
  })

  test('returns a quote for minting w/ WETH', async () => {
    const request = {
      isMinting: true,
      inputToken: weth,
      outputToken: indexToken,
      indexTokenAmount: wei(1).toBigInt(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount > 0).toBe(true)
    expect(quote.componentsSwapData.length).toBe(2)
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
      swapDataEthToInputToken,
    )
  })

  test('returns a quote for minting w/ USDC', async () => {
    const request = {
      isMinting: true,
      inputToken: usdc,
      outputToken: indexToken,
      indexTokenAmount: wei(1).toBigInt(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount > 0).toBe(true)
    expect(quote.componentsSwapData.length).toBe(2)
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
      swapDataEthToInputToken,
    )
  })

  test('returns a quote for redeeming to ETH', async () => {
    const request = {
      isMinting: false,
      inputToken: indexToken,
      outputToken: eth,
      indexTokenAmount: wei(1).toBigInt(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount > 0).toBe(true)
    expect(quote.componentsSwapData.length).toBe(2)
    expect(quote.swapDataEthToInputOutputToken).toBeNull()
    expect(quote.swapDataInputTokenToEth).toBeNull()
  })

  test('returns a quote for redeeming to ERC-20', async () => {
    const request = {
      isMinting: false,
      inputToken: indexToken,
      outputToken: usdc,
      indexTokenAmount: wei(1).toBigInt(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintHyEthQuoteProvider(
      rpcUrl,
      swapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputTokenAmount > 0).toBe(true)
    expect(quote.componentsSwapData.length).toBe(2)
    expect(quote.swapDataInputTokenToEth).toBeNull()
    const swapDataEthToInputToken = {
      path: [WETH.address, USDC.address],
      fees: [500],
      pool: AddressZero,
      exchange: Exchange.UniV3,
    }
    expect(quote.swapDataEthToInputOutputToken).toStrictEqual(
      swapDataEthToInputToken,
    )
  })
})
