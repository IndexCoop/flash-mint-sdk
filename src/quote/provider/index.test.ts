import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import { ChainId } from 'constants/chains'
import { Contracts } from 'constants/contracts'
import { ETH } from 'constants/tokens'
import {
  getLocalHostProviderUrl,
  getZeroExSwapQuoteProvider,
  getZeroExV2SwapQuoteProvider,
  wei,
} from 'tests/utils'

import {
  FlashMintContractType,
  FlashMintQuoteProvider,
  type FlashMintQuoteRequest,
} from '.'

const chainId = ChainId.Mainnet
const rpcUrl = getLocalHostProviderUrl(chainId)
const zeroexSwapQuoteProvider = getZeroExSwapQuoteProvider(chainId)
const zeroExV2SwapQuoteProvider = getZeroExV2SwapQuoteProvider()

const FlashMintHyEthAddress = Contracts[ChainId.Mainnet].FlashMintHyEthV3
const hyeth = getTokenByChainAndSymbol(chainId, 'hyETH')
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
      zeroexSwapQuoteProvider,
    )
    await expect(quoteProvider.getQuote(request)).rejects.toThrow(
      'Index token not supported',
    )
  })

  test('returns a quote for minting ETH2X (Arbitrum)', async () => {
    const FlashMintLeveragedZeroEx =
      Contracts[ChainId.Arbitrum].FlashMintLeveragedZeroEx
    const rpcUrl = getLocalHostProviderUrl(ChainId.Arbitrum)
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(ChainId.Arbitrum, 'USDC'),
      outputToken: getTokenByChainAndSymbol(ChainId.Arbitrum, 'ETH2X'),
      indexTokenAmount: wei(1).toString(),
      inputTokenAmount: wei(300, 6).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      getZeroExSwapQuoteProvider(ChainId.Arbitrum),
      zeroExV2SwapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.chainId).toEqual(ChainId.Arbitrum)
    expect(quote.contractType).toEqual(FlashMintContractType.leveragedZeroEx)
    expect(quote.contract).toEqual(FlashMintLeveragedZeroEx)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintLeveragedZeroEx)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for minting hyETH', async () => {
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: ETH,
      outputToken: hyeth,
      indexTokenAmount: wei(1).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      zeroexSwapQuoteProvider,
      zeroExV2SwapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.chainId).toEqual(ChainId.Mainnet)
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

  test('returns a quote for minting uSOL3x', async () => {
    const FlashMintLeveragedZeroEx =
      Contracts[ChainId.Base].FlashMintLeveragedZeroEx
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: getTokenByChainAndSymbol(ChainId.Base, 'USDC'),
      outputToken: getTokenByChainAndSymbol(ChainId.Base, 'uSOL3x'),
      indexTokenAmount: wei(1).toString(),
      inputTokenAmount: wei(300, 6).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      getLocalHostProviderUrl(ChainId.Base),
      getZeroExSwapQuoteProvider(ChainId.Base),
      getZeroExV2SwapQuoteProvider(),
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.chainId).toEqual(ChainId.Base)
    expect(quote.contractType).toEqual(FlashMintContractType.leveragedZeroEx)
    expect(quote.contract).toEqual(FlashMintLeveragedZeroEx)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintLeveragedZeroEx)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming ETH2X', async () => {
    const FlashMintLeveragedZeroEx =
      Contracts[ChainId.Arbitrum].FlashMintLeveragedZeroEx
    const rpcUrl = getLocalHostProviderUrl(ChainId.Arbitrum)
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(ChainId.Arbitrum, 'ETH2X'),
      outputToken: getTokenByChainAndSymbol(ChainId.Arbitrum, 'USDC'),
      indexTokenAmount: wei(1).toString(),
      inputTokenAmount: wei(1).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      getZeroExSwapQuoteProvider(ChainId.Arbitrum),
      zeroExV2SwapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.chainId).toEqual(ChainId.Arbitrum)
    expect(quote.contractType).toEqual(FlashMintContractType.leveragedZeroEx)
    expect(quote.contract).toEqual(FlashMintLeveragedZeroEx)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintLeveragedZeroEx)
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
      zeroexSwapQuoteProvider,
      zeroExV2SwapQuoteProvider,
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.chainId).toEqual(ChainId.Mainnet)
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
    const iceth = getTokenByChainAndSymbol(ChainId.Mainnet, 'icETH')
    const expectedContract =
      Contracts[ChainId.Mainnet].FlashMintLeveragedZeroEx_AaveV2
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken: iceth,
      outputToken: ETH,
      indexTokenAmount: wei(1).toString(),
      inputTokenAmount: wei(1).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      zeroexSwapQuoteProvider,
      getZeroExV2SwapQuoteProvider(),
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.chainId).toEqual(ChainId.Mainnet)
    expect(quote.contractType).toEqual(FlashMintContractType.leveragedZeroEx)
    expect(quote.contract).toEqual(expectedContract)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.outputAmount).toEqual(quote.inputOutputAmount)
    expect(quote.indexTokenAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(expectedContract)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming uSOL3x', async () => {
    const FlashMintLeveragedZeroEx =
      Contracts[ChainId.Base].FlashMintLeveragedZeroEx
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken: getTokenByChainAndSymbol(ChainId.Base, 'uSOL3x'),
      outputToken: getTokenByChainAndSymbol(ChainId.Base, 'USDC'),
      indexTokenAmount: wei(1).toString(),
      inputTokenAmount: wei(1).toString(),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(
      getLocalHostProviderUrl(ChainId.Base),
      getZeroExSwapQuoteProvider(ChainId.Base),
      getZeroExV2SwapQuoteProvider(),
    )
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    expect(quote.chainId).toEqual(ChainId.Base)
    expect(quote.contractType).toEqual(FlashMintContractType.leveragedZeroEx)
    expect(quote.contract).toEqual(FlashMintLeveragedZeroEx)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.inputAmount.toString()).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintLeveragedZeroEx)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })
})
