import { BigNumber } from '@ethersproject/bignumber'

import {
  ComponentSwapData,
  ComponentWrapData,
  getFlashMintWrappedContract,
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
  getWrapData,
  slippageAdjustedTokenAmount,
} from 'utils'
import { getRpcProvider } from 'utils/rpc-provider'

import { QuoteProvider, QuoteToken } from '../../interfaces'

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
  constructor(private readonly rpcUrl: string) {}

  async getQuote(
    request: FlashMintWrappedQuoteRequest
  ): Promise<FlashMintWrappedQuote | null> {
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request
    console.log(
      inputToken.symbol,
      outputToken.symbol,
      indexTokenAmount.toString(),
      isMinting,
      slippage
    )
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const componentSwapData = isMinting
      ? await getIssuanceComponentSwapData(
          {
            indexTokenSymbol,
            indexToken: indexToken.address,
            inputToken: inputToken.address,
            indexTokenAmount,
          },
          this.rpcUrl
        )
      : await getRedemptionComponentSwapData(
          {
            indexTokenSymbol,
            indexToken: indexToken.address,
            outputToken: outputToken.address,
            indexTokenAmount,
          },
          this.rpcUrl
        )
    console.log(componentSwapData)
    const componentWrapData = getWrapData(indexToken.symbol)
    // FIXME: add check
    // if (componentSwapData.length !== componentWrapData.length) return null
    let estimatedInputOutputAmount: BigNumber = BigNumber.from(0)
    const provider = getRpcProvider(this.rpcUrl)
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
    // FIXME: add slippage?
    const inputOutputTokenAmount = slippageAdjustedTokenAmount(
      estimatedInputOutputAmount,
      isMinting ? inputToken.decimals : outputToken.decimals,
      slippage,
      isMinting
    )
    const quote: FlashMintWrappedQuote = {
      componentSwapData,
      componentWrapData,
      indexTokenAmount,
      inputOutputTokenAmount,
    }
    return quote
  }
}
