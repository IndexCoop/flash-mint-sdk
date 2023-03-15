import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ZeroExApi } from '../../utils/0x'
import { ComponentSwapData } from '../../utils/componentSwapData'
import { ComponentWrapData } from '../../utils/wrapData'
import { QuoteProvider } from '../quoteProvider'
import { QuoteToken } from '..//quoteToken'

export interface FlashMintWrappedQuoteRequest {
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  slippage: number
}

export interface FlashMintWrappedQuote {
  componentSwapData: ComponentSwapData[]
  componentWrapData: ComponentWrapData[]
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
}

export class WrappedQuoteProvider implements QuoteProvider {
  constructor(private readonly provider: JsonRpcProvider) {}

  async getQuote<FlashMintWrappedQuoteRequest, FlashMintWrappedQuote>(
    request: FlashMintWrappedQuoteRequest
  ): Promise<FlashMintWrappedQuote | null> {
    const { provider } = this
    const network = await provider.getNetwork()
    const chainId = network.chainId
    return null
  }
}
