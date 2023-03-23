import { BigNumber } from '@ethersproject/bignumber'

import { QuoteProvider } from './quoteProvider'
import { QuoteToken } from './quoteToken'

export interface FlashMintQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  slippage: number
}

export interface FlashMintQuote {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  slippage: number
}

export class FlashMintQuoteProvider
  implements QuoteProvider<FlashMintQuoteRequest, FlashMintQuote>
{
  async getQuote(
    request: FlashMintQuoteRequest
  ): Promise<FlashMintQuote | null> {
    return null
  }
}
