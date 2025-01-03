/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { IndexCoopEthereum2xIndex } from 'constants/tokens'
import { getFlashMintLeveragedContractForToken, wei } from 'utils'
import { getRpcProvider } from 'utils/rpc-provider'

import {
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
  QuoteTokens,
} from 'tests/utils'

import {
  FlashMintContractType,
  FlashMintQuoteProvider,
  FlashMintQuoteRequest,
} from '.'

const chainId = ChainId.Mainnet
const rpcUrl = getLocalHostProviderUrl(chainId)
const provider = getRpcProvider(rpcUrl)
const zeroexSwapQuoteProvider = getZeroExSwapQuoteProvider(chainId)

const FlashMintHyEthAddress = Contracts[ChainId.Mainnet].FlashMintHyEthV3
const { eth } = QuoteTokens
const eth2x = getTokenByChainAndSymbol(chainId, 'ETH2X')
const hyeth = getTokenByChainAndSymbol(chainId, 'hyETH')
const iceth = getTokenByChainAndSymbol(chainId, 'icETH')
const usdc = getTokenByChainAndSymbol(chainId, 'USDC')

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
      indexTokenAmount: wei(1).toString(),
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
    const rpcUrl = getLocalHostProviderUrl(ChainId.Arbitrum)
    const arbitrumProvider = getRpcProvider(rpcUrl)
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
      indexTokenAmount: wei(1).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      getZeroExSwapQuoteProvider(ChainId.Arbitrum)
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
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
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
      indexTokenAmount: wei(1).toString(),
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
    expect(quote.contractType).toEqual(FlashMintContractType.hyeth)
    expect(quote.contract).toEqual(FlashMintHyEthAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintHyEthAddress)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for minting icUSD', async () => {
    const chainId = ChainId.Base
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(chainId, 'USDC'),
      outputToken: getTokenByChainAndSymbol(chainId, 'icUSD'),
      indexTokenAmount: wei(1).toString(),
      inputTokenAmount: wei(100, 6).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      getLocalHostProviderUrl(chainId),
      getZeroExSwapQuoteProvider(chainId)
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const FlashMintNavAddress = Contracts[chainId].FlashMintWrapped
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.wrapped)
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
    const rpcUrl = getLocalHostProviderUrl(ChainId.Arbitrum)
    const arbitrumProvider = getRpcProvider(rpcUrl)
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
      indexTokenAmount: wei(1).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      getZeroExSwapQuoteProvider(ChainId.Arbitrum)
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
    expect(quote.inputAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
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
      indexTokenAmount: wei(1).toString(),
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
    expect(quote.contractType).toEqual(FlashMintContractType.hyeth)
    expect(quote.contract).toEqual(FlashMintHyEthAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputAmount.toString()).toEqual(request.indexTokenAmount)
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
      indexTokenAmount: wei(1).toString(),
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
    expect(quote.inputAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming icUSD', async () => {
    const chainId = ChainId.Base
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(chainId, 'icUSD'),
      outputToken: getTokenByChainAndSymbol(chainId, 'USDC'),
      indexTokenAmount: wei(1).toString(),
      // Note that input token amount is essential to determine here if the test
      // fails or not. For example larger amounts might return FlashMintWrapped instead of (FMNav)
      inputTokenAmount: wei(1).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      getLocalHostProviderUrl(chainId),
      getZeroExSwapQuoteProvider(chainId)
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const FlashMintContractAddress = Contracts[chainId].FlashMintWrapped
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.wrapped)
    expect(quote.contract).toEqual(FlashMintContractAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintContractAddress)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })
})
