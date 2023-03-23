import { MoneyMarketIndex, USDC } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { LocalhostProvider } from 'tests/utils'
import { ZeroExApiSwapQuote } from 'tests/utils'
import { wei } from 'utils/numbers'
import {
  FlashMintQuote,
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
    const quoteProvider = new FlashMintQuoteProvider()
    await expect(quoteProvider.getQuote(request)).rejects.toThrow()
  })

  test('returns a quote for minting MMI', async () => {
    const inputToken = usdc
    const request: FlashMintQuoteRequest = {
      isMinting: true,
      inputToken,
      outputToken: indexToken,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider()
    const quote = await quoteProvider.getQuote(request)
    expect(quote).toBeNull()
  })
})
