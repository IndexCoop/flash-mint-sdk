import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'

import { QuoteProvider } from './quoteProvider'
import { QuoteToken } from './quoteToken'

enum FlashMintContractType {
  leveraged,
  wrapped,
  zeroEx,
}

export interface FlashMintQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  slippage: number
}

export interface FlashMintQuote {
  chainId: number
  contractType: FlashMintContractType
  contract: string
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  inputOutputAmount: BigNumber
  slippage: number
  tx: TransactionRequest
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
