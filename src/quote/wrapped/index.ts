import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import {
  ComponentSwapData,
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from '../../utils/componentSwapData'
import { slippageAdjustedTokenAmount } from '../../utils/slippage'
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
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request
    const indexTokenAddress = isMinting
      ? outputToken.address
      : inputToken.address
    const indexTokenSymbol = isMinting ? outputToken.symbol : inputToken.symbol
    const componentSwapData = isMinting
      ? await getIssuanceComponentSwapData(
          indexTokenSymbol,
          indexTokenAddress,
          inputToken.address,
          indexTokenAmount,
          provider
        )
      : await getRedemptionComponentSwapData(outputToken.address)
    const indexTokenMix = getIndexTokenMix(indexTokenSymbol)
    const wrapData = getWrapData(indexTokenMix)
    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      // TODO: get estimated input/output amount
      BigNumber.from(0),
      isMinting ? inputToken.decimals : outputToken.decimals,
      slippage,
      isMinting
    )
    // TODO: return quote object
    const quote: FlashMintWrappedQuote = {
      componentSwapData,
      componentWrapData: wrapData,
      indexTokenAmount,
      inputOutputTokenAmount,
    }
    return quote
  }
}
