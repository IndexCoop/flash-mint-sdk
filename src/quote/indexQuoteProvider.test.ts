import { FlashMint4626Address } from 'constants/contracts'
import { LocalhostProvider, QuoteTokens, ZeroExApiSwapQuote } from 'tests/utils'
import { wei } from 'utils/numbers'

import {
  FlashMintContractType,
  FlashMintQuoteProvider,
  FlashMintQuoteRequest,
} from '.'
import {
  getFlashMintLeveragedContractForToken,
  getFlashMintZeroExContractForToken,
} from 'utils'

const provider = LocalhostProvider
const zeroEx = ZeroExApiSwapQuote

const { dseth, eth, iceth, mmi: indexToken, mvi, usdc } = QuoteTokens

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

  test('meta data is returned correctly', async () => {
    const inputToken = usdc
    const outputToken = indexToken
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    // Only testing for values that have been provided (meta data)
    // or that are indirectly determined from the quote request
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.erc4626)
    expect(quote.contract).toEqual(FlashMint4626Address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.slippage).toEqual(request.slippage)
  })

  test('returns a quote for minting MMI', async () => {
    const inputToken = usdc
    const outputToken = indexToken
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.erc4626)
    expect(quote.contract).toEqual(FlashMint4626Address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMint4626Address)
    expect(quote.tx.data?.length).toBeGreaterThan(0)
  })

  test('returns a quote for redeeming MMI', async () => {
    const inputToken = indexToken
    const outputToken = usdc
    const request: FlashMintQuoteRequest = {
      isMinting: false,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(request)
    if (!quote) fail()
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.erc4626)
    expect(quote.contract).toEqual(FlashMint4626Address)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    expect(quote.tx).not.toBeNull()
    expect(quote.tx.to).toBe(FlashMint4626Address)
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
