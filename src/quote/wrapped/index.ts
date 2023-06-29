import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'

import {
  ComponentSwapData,
  ComponentWrapData,
  erc4626SwapData,
  getFlashMint4626Contract,
  getFlashMintWrappedContract,
  getIssuanceComponentSwapData,
  getRedemptionComponentSwapData,
  getWrapData,
  slippageAdjustedTokenAmount,
  ZeroExApi,
} from 'utils'
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
export interface ERC4626WrappedQuote {
  componentSwapData: erc4626SwapData[]
  indexTokenAmount: BigNumber
  inputOutputTokenAmount: BigNumber
}

export class WrappedQuoteProvider
  implements QuoteProvider<FlashMintWrappedQuoteRequest, FlashMintWrappedQuote>
{
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly zeroExApi: ZeroExApi
  ) {}

  async getQuote(
    request: FlashMintWrappedQuoteRequest
  ): Promise<FlashMintWrappedQuote | null> {
    const { provider, zeroExApi } = this
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
          provider,
          zeroExApi
        )
      : await getRedemptionComponentSwapData(
          indexTokenSymbol,
          indexToken.address,
          outputToken.address,
          indexTokenAmount,
          provider,
          zeroExApi
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
    const quote: FlashMintWrappedQuote = {
      componentSwapData,
      componentWrapData,
      indexTokenAmount,
      inputOutputTokenAmount,
    }
    return quote
  }
}
export class ERC4626QuoteProvider
  implements QuoteProvider<FlashMintWrappedQuoteRequest, ERC4626WrappedQuote>
{
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly zeroExApi: ZeroExApi
  ) {}

  async getQuote(
    request: FlashMintWrappedQuoteRequest
  ): Promise<ERC4626WrappedQuote | null> {
    const { provider, zeroExApi } = this
    const { inputToken, indexTokenAmount, isMinting, outputToken, slippage } =
      request
    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenSymbol = indexToken.symbol
    const componentSwapData = isMinting
      ? // TODO: test replacing w/ dynamic swap data
        await getIssuanceComponentSwapData(
          indexTokenSymbol,
          indexToken.address,
          inputToken.address,
          indexTokenAmount,
          provider,
          zeroExApi
        )
      : await getRedemptionComponentSwapData(
          indexTokenSymbol,
          indexToken.address,
          outputToken.address,
          indexTokenAmount,
          provider,
          zeroExApi
        )
    let estimatedInputOutputAmount: BigNumber = BigNumber.from(0)
    const contract = getFlashMint4626Contract(provider)
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
    const quote: ERC4626WrappedQuote = {
      componentSwapData,
      indexTokenAmount,
      inputOutputTokenAmount,
    }
    return quote
  }
}
