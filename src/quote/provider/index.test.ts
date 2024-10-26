/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { IndexCoopEthereum2xIndex } from 'constants/tokens'
import { getFlashMintLeveragedContractForToken, wei } from 'utils'

import {
  IndexZeroExSwapQuoteProvider,
  IndexZeroExSwapQuoteProviderArbitrum,
  LocalhostProvider,
  LocalhostProviderArbitrum,
  LocalhostProviderUrl,
  LocalhostProviderUrlArbitrum,
  QuoteTokens,
} from 'tests/utils'

import {
  FlashMintContractType,
  FlashMintQuoteProvider,
  FlashMintQuoteRequest,
} from '.'

const rpcUrl = LocalhostProviderUrl
const provider = LocalhostProvider
const zeroexSwapQuoteProvider = IndexZeroExSwapQuoteProvider

const FlashMintHyEthAddress = Contracts[ChainId.Mainnet].FlashMintHyEthV3
const { eth, eth2x, hyeth, iceth, icusd, usdc } = QuoteTokens

describe('FlashMintQuoteProvider()', () => {
  test('throws if token is unsupported', async () => {
    const inputToken = usdc
    const outputToken = {
      address: '0x0',
      decimals: 18,
      symbol: 'AMKT',
    }
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      zeroexSwapQuoteProvider
    )
    await expect(quoteProvider.getQuote(request)).rejects.toThrow(
      'Index token not supported'
    )
  })

  test('returns a quote for minting ETH2X', async () => {
    const arbitrumProvider = LocalhostProviderArbitrum
    const inputToken = usdc
    const outputToken = {
      address: IndexCoopEthereum2xIndex.addressArbitrum!,
      decimals: eth2x.decimals,
      symbol: eth2x.symbol,
    }
    const contract = getFlashMintLeveragedContractForToken(
      outputToken.symbol,
      arbitrumProvider,
      ChainId.Arbitrum
    )
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      LocalhostProviderUrlArbitrum,
      IndexZeroExSwapQuoteProviderArbitrum
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await arbitrumProvider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.leveragedExtended)
    expect(quote.contract).toEqual(contract.address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for minting hyETH', async () => {
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: usdc,
      outputToken: hyeth,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      LocalhostProviderUrl,
      IndexZeroExSwapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.hyeth)
    expect(quote.contract).toEqual(FlashMintHyEthAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintHyEthAddress)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  // Keep in case we have a presale with USDC only
  test.skip('returns a quote for minting icUSD', async () => {
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: usdc,
      outputToken: icusd,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      LocalhostProviderUrl,
      IndexZeroExSwapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const FlashMintWrappedAddress = Contracts[ChainId.Mainnet].FlashMintWrapped
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.wrapped)
    expect(quote.contract).toEqual(FlashMintWrappedAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintWrappedAddress)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  // FIXME: skip while testing and minting does not work with FLashMintNav at the moment
  test.skip('returns a quote for minting icUSD', async () => {
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: usdc,
      outputToken: icusd,
      indexTokenAmount: wei(1),
      inputTokenAmount: wei(100, 6),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      LocalhostProviderUrl,
      IndexZeroExSwapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    console.log(quote)
    console.log(quote.inputAmount.toString(), quote.outputAmount.toString())
    console.log(
      quote.inputOutputAmount.toString(),
      quote.indexTokenAmount.toString()
    )
    const FlashMintNavAddress = Contracts[ChainId.Mainnet].FlashMintNav
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.nav)
    expect(quote.contract).toEqual(FlashMintNavAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount).toEqual(quote.outputAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintNavAddress)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming ETH2X', async () => {
    const arbitrumProvider = LocalhostProviderArbitrum
    const inputToken = {
      address: IndexCoopEthereum2xIndex.addressArbitrum!,
      decimals: eth2x.decimals,
      symbol: eth2x.symbol,
    }
    const outputToken = usdc
    const contract = getFlashMintLeveragedContractForToken(
      inputToken.symbol,
      arbitrumProvider,
      ChainId.Arbitrum
    )
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      LocalhostProviderUrlArbitrum,
      IndexZeroExSwapQuoteProviderArbitrum
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await arbitrumProvider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.leveragedExtended)
    expect(quote.contract).toEqual(contract.address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming hyETH', async () => {
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken: hyeth,
      outputToken: usdc,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      LocalhostProviderUrl,
      IndexZeroExSwapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.hyeth)
    expect(quote.contract).toEqual(FlashMintHyEthAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputAmount).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintHyEthAddress)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming icETH', async () => {
    const inputToken = iceth
    const outputToken = eth
    const contract = getFlashMintLeveragedContractForToken(
      inputToken.symbol,
      undefined,
      1
    )
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      zeroexSwapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.leveraged)
    expect(quote.contract).toEqual(contract.address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming icUSD', async () => {
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken: icusd,
      outputToken: usdc,
      indexTokenAmount: wei(1),
      // Note that input token amount is essential to determine here if the test
      // fails or not. For example larger amounts might return FlashMintWrapped instead of (FMNav)
      inputTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      LocalhostProviderUrl,
      IndexZeroExSwapQuoteProvider
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const FlashMintNavAddress = Contracts[ChainId.Mainnet].FlashMintNav
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.nav)
    expect(quote.contract).toEqual(FlashMintNavAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintNavAddress)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })
})
