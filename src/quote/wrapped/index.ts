import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import { ZeroExApi } from '../../utils/0x'
import {
  ComponentSwapData,
  getIssuanceComponentSwapData,
} from '../../utils/componentSwapData'
import {
  ComponentWrapData,
  getIndexTokenMix,
  getWrapData,
} from '../../utils/wrapData'
import { QuoteProvider } from '../quoteProvider'
import { QuoteToken } from '../quoteToken'

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

export class WrappedQuoteProvider
  implements QuoteProvider<FlashMintWrappedQuoteRequest, FlashMintWrappedQuote>
{
  constructor(private readonly provider: JsonRpcProvider) {}

  async getQuote(
    request: FlashMintWrappedQuoteRequest
  ): Promise<FlashMintWrappedQuote | null> {
    const { provider } = this
    const { inputToken, indexTokenAmount, outputToken } = request
    const indexTokenAddress = outputToken.address
    const indexTokenSymbol = outputToken.symbol
    // TODO: need this?
    // const network = await provider.getNetwork()
    // const chainId = network.chainId
    const componentSwapData = await getIssuanceComponentSwapData(
      indexTokenSymbol,
      indexTokenAddress,
      inputToken.address,
      indexTokenAmount,
      provider
    )
    const indexTokenMix = getIndexTokenMix(indexTokenSymbol)
    const wrapData = getWrapData(indexTokenMix)
    // TODO: get estimated input/output amount
    const inputOutputTokenAmount = BigNumber.from(0)
    // TODO: return quote object
    const quote: FlashMintWrappedQuote = {
      componentSwapData: componentSwapData,
      componentWrapData: wrapData,
      indexTokenAmount: indexTokenAmount,
      inputOutputTokenAmount,
    }
    return quote
  }
}
