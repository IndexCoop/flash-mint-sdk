import { FlashMintWrappedAddress } from 'constants/contracts'
import { MoneyMarketIndex, USDC } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { LocalhostProvider } from 'tests/utils'
import { ZeroExApiSwapQuote } from 'tests/utils'
import { wei } from 'utils/numbers'
import {
  FlashMintContractType,
  FlashMintQuoteProvider,
  FlashMintQuoteRequest,
} from '.'

const provider = LocalhostProvider
// const zeroExApi = ZeroExApiSwapQuote

const indexToken: QuoteToken = {
  address: MoneyMarketIndex.address!,
  decimals: 18,
  symbol: MoneyMarketIndex.symbol,
}

const usdc: QuoteToken = {
  address: USDC.address!,
  decimals: 6,
  symbol: USDC.symbol,
}

describe('FlashMintQuoteProvider()', () => {
  test('for now anything except MMI is unsupported', async () => {
    const inputToken = usdc
    const outputToken = {
      address: '0x0',
      decimals: 18,
      symbol: 'DPI',
    }
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    await expect(quoteProvider.getQuote(request)).rejects.toThrow()
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
    // Only testing for values that have been provider (meta data)
    // or that are indirectly determined from the quote request
    const chainId = (await provider.getNetwork()).chainId
    expect(quote.chainId).toEqual(chainId)
    expect(quote.contractType).toEqual(FlashMintContractType.wrapped)
    expect(quote.contract).toEqual(FlashMintWrappedAddress)
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
    expect(quote.contractType).toEqual(FlashMintContractType.wrapped)
    expect(quote.contract).toEqual(FlashMintWrappedAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    // TODO: test
    // expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    // TODO: test for tx
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
    expect(quote.contractType).toEqual(FlashMintContractType.wrapped)
    expect(quote.contract).toEqual(FlashMintWrappedAddress)
    expect(quote.isMinting).toEqual(request.isMinting)
    expect(quote.inputToken).toEqual(request.inputToken)
    expect(quote.outputToken).toEqual(request.outputToken)
    expect(quote.indexTokenAmount).toEqual(request.indexTokenAmount)
    // TODO: test
    // expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(request.slippage)
    // TODO: test for tx
  })
})
