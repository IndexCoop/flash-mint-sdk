import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'
import { utils } from 'ethers'

import {
  ComponentSwapData,
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
} from '../../utils/componentSwapData'
import { getFlashMintWrappedContract } from '../../utils/contracts'
import { slippageAdjustedTokenAmount } from '../../utils/slippage'
import { ComponentWrapData, getWrapData } from '../../utils/wrapData'
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
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const componentSwapData = isMinting
      ? await getIssuanceComponentSwapData(
          indexTokenSymbol,
          indexToken.address,
          inputToken.address,
          indexTokenAmount,
          provider
        )
      : await getRedemptionComponentSwapData(
          indexTokenSymbol,
          indexToken.address,
          outputToken.address,
          indexTokenAmount,
          provider
        )
    const componentWrapData = getWrapData(indexToken.symbol)
    if (componentSwapData.length !== componentSwapData.length) return null
    let estimatedInputOutputAmount: BigNumber = BigNumber.from(0)
    const contract = getFlashMintWrappedContract(provider)
    if (isMinting) {
      estimatedInputOutputAmount = await contract.callStatic.getIssueExactSet(
        indexToken.address,
        inputToken.address,
        indexTokenAmount,
        componentSwapData
      )
    } else {
      estimatedInputOutputAmount = await contract.callStatic.getRedeemExactSet(
        indexToken.address,
        outputToken.address,
        indexTokenAmount,
        componentSwapData
      )
    }
    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      isMinting ? inputToken.decimals : outputToken.decimals,
      slippage,
      isMinting
    )
    console.log(estimatedInputOutputAmount.toString(), 'estimate')
    console.log(inputOutputTokenAmount.toString(), 'slippage adjusted')
    const quote: FlashMintWrappedQuote = {
      componentSwapData,
      componentWrapData,
      indexTokenAmount,
      inputOutputTokenAmount,
    }
    return quote
  }
}
