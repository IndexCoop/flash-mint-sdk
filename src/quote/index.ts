import { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { FlashMintWrappedAddress } from '../constants/contracts'

import { QuoteProvider } from './quoteProvider'
import { QuoteToken } from './quoteToken'

export enum FlashMintContractType {
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
  constructor(private readonly provider: JsonRpcProvider) {}

  async getQuote(
    request: FlashMintQuoteRequest
  ): Promise<FlashMintQuote | null> {
    const { provider } = this
    const { indexTokenAmount, inputToken, isMinting, outputToken, slippage } =
      request
    const indexToken = isMinting ? outputToken : inputToken
    const contractType = getContractType(indexToken.symbol)
    if (contractType !== FlashMintContractType.wrapped) {
      throw new Error('Index token not supported')
    }
    const contractAddress = getContractAddress(contractType)
    const network = await provider.getNetwork()
    const chainId = network.chainId
    return {
      chainId,
      contractType,
      contract: contractAddress,
      isMinting,
      inputToken,
      outputToken,
      indexTokenAmount,
      inputOutputAmount: BigNumber.from(0),
      slippage,
      tx: {},
    }
  }
}

function getContractAddress(contractType: FlashMintContractType): string {
  switch (contractType) {
    case FlashMintContractType.wrapped:
      return FlashMintWrappedAddress
    default:
      return ''
  }
}

// Returns contract type for token or null if not supported
function getContractType(token: string): FlashMintContractType | null {
  if (token === 'MMI') return FlashMintContractType.wrapped
  return null
}
