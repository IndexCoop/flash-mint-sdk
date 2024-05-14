/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { ChainId } from 'constants/chains'
import { FlashMintZeroExMainnetAddress } from 'constants/contracts'
import { IndexCoopEthereum2xIndex } from 'constants/tokens'
import {
  LocalhostProvider,
  LocalhostProviderArbitrum,
  QuoteTokens,
  ZeroExApiArbitrumSwapQuote,
  ZeroExApiSwapQuote,
} from 'tests/utils'
import {
  getFlashMintLeveragedContractForToken,
  getFlashMintZeroExContractForToken,
  wei,
} from 'utils'
import {
  FlashMintContractType,
  FlashMintQuoteProvider,
  FlashMintQuoteRequest,
} from '.'

const provider = LocalhostProvider
const zeroEx = ZeroExApiSwapQuote

const { cdeti, dseth, eth, eth2x, iceth, mvi, usdc } = QuoteTokens

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
    const quoteProvider = new FlashMintQuoteProvider(provider)
    await expect(quoteProvider.getQuote(request)).rejects.toThrow(
      'Index token not supported'
    )
  })

  test('returns a quote for minting cdETI', async () => {
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken: eth,
      outputToken: cdeti,
      indexTokenAmount: wei(1),
      slippage: 0.1,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider, zeroEx)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.zeroEx)
    expect(quote.contract).toEqual(FlashMintZeroExMainnetAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMintZeroExMainnetAddress)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for minting dsETH', async () => {
    const inputToken = usdc
    const outputToken = dseth
    const contract = getFlashMintZeroExContractForToken(
      outputToken.symbol,
      undefined
    )
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider, zeroEx)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.zeroEx)
    expect(quote.contract).toEqual(contract.address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming dsETH', async () => {
    const inputToken = dseth
    const outputToken = usdc
    const contract = getFlashMintZeroExContractForToken(
      inputToken.symbol,
      undefined
    )
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider, zeroEx)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.zeroEx)
    expect(quote.contract).toEqual(contract.address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
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
      arbitrumProvider,
      ZeroExApiArbitrumSwapQuote
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
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
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
      arbitrumProvider,
      ZeroExApiArbitrumSwapQuote
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
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
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
    const quoteProvider = new FlashMintQuoteProvider(provider, zeroEx)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.leveraged)
    expect(quote.contract).toEqual(contract.address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(contract.address)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('should fail if zeroExApiV1 is undefined for contract type leveraged', async () => {
    const inputToken = usdc
    const outputToken = iceth
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    await expect(quoteProvider.getQuote(request)).rejects.toThrow(
      'Contract type requires ZeroExApiV1 to be defined'
    )
  })

  test('should fail if zeroExApiV1 is undefined for contract type zeroEx', async () => {
    const inputToken = usdc
    const outputToken = mvi
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    await expect(quoteProvider.getQuote(request)).rejects.toThrow(
      'Contract type requires ZeroExApiV1 to be defined'
    )
  })
})
