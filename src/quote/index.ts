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
    const { inputToken, isMinting, outputToken } = request
    const indexToken = isMinting ? outputToken : inputToken
    const contractType = getContractType(indexToken.symbol)
    if (contractType !== FlashMintContractType.wrapped) {
      throw new Error('Index token not supported')
    }
    return null
  }
}

// Returns contract type for token or null if not supported
function getContractType(token: string): FlashMintContractType | null {
  if (token === 'MMI') return FlashMintContractType.wrapped
  return null
}
