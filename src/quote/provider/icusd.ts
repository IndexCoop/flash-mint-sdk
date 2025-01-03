import { BigNumber } from '@ethersproject/bignumber'
import { getTokenByChainAndSymbol } from '@indexcoop/tokenlists'

import {
  type FlashMintWrappedBuildRequest,
  WrappedTransactionBuilder,
} from 'flashmint'

import { WrappedQuoteProvider } from '../flashmint/wrapped'
import type { QuoteProvider, QuoteToken } from '../interfaces'
import {
  FlashMintContractType,
  type FlashMintQuote,
  type FlashMintQuoteRequest,
} from '../provider'
import type { SwapQuoteProvider } from '../swap'
import { buildQuoteResponse } from './utils'

export interface IcUsdQuoteRequest extends FlashMintQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: string
  // FlashMintNav always needs the input amount
  inputTokenAmount: string
  slippage: number
}

export class IcUsdQuoteRouter
  implements QuoteProvider<IcUsdQuoteRequest, FlashMintQuote>
{
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider,
  ) {}

  async getQuote(request: IcUsdQuoteRequest): Promise<FlashMintQuote | null> {
    const { chainId } = request
    const usdc = getTokenByChainAndSymbol(chainId, 'USDC')
    const icUsd = getTokenByChainAndSymbol(chainId, 'icUSD')
    if (!usdc || !icUsd) {
      throw new Error(`icUSD not supported on chainId: ${chainId}`)
    }
    // For now we only use FlashMintWrapped
    // if (request.isMinting) {
    //   return await this.getFlashMintNavQuote(request)
    // } else {
    //   const usdcBalance = await getBalanceOf(
    //     usdc.address,
    //     icUsd.address as Address,
    //     chainId
    //   )
    //   const usdcInputAmount = await getExpectedReserveRedeemQuantity(
    //     icUsd.address as Address,
    //     usdc.address,
    //     indexTokenAmount.toBigInt()
    //   )
    //   console.log(usdcBalance.toString(), 'USDC')
    //   // 80% of the USDC balance of icUSD
    //   const threshold = (usdcBalance * 80n) / 100n
    //   const useFlashMintNav = usdcInputAmount < threshold
    //   if (useFlashMintNav) return await this.getFlashMintNavQuote(request)
    return await this.getFlashMintWrappedQuote(request)
    // }
  }

  // private async getFlashMintNavQuote(request: IcUsdQuoteRequest) {
  //   const { chainId, inputToken, isMinting, outputToken } = request
  //   const flashMintNavQuoteProvider = new FlashMintNavQuoteProvider(
  //     this.rpcUrl,
  //     this.swapQuoteProvider
  //   )
  //   const fmNavQuote = await flashMintNavQuoteProvider.getQuote({
  //     ...request,
  //   })
  //   if (!fmNavQuote) return null
  //   const builder = new FlashMintNavTransactionBuilder(this.rpcUrl)
  //   const txRequest = {
  //     isMinting,
  //     inputToken: inputToken.address,
  //     inputTokenSymbol: inputToken.symbol,
  //     outputToken: outputToken.address,
  //     outputTokenSymbol: outputToken.symbol,
  //     inputTokenAmount: fmNavQuote.inputTokenAmount,
  //     outputTokenAmount: fmNavQuote.outputTokenAmount,
  //     reserveAssetSwapData: fmNavQuote.reserveAssetSwapData,
  //   }
  //   const tx = await builder.build(txRequest)
  //   if (!tx) return null
  //   return buildQuoteResponse(
  //     request,
  //     chainId,
  //     FlashMintContractType.nav,
  //     isMinting ? fmNavQuote.inputTokenAmount : fmNavQuote.outputTokenAmount,
  //     tx
  //   )
  // }

  private async getFlashMintWrappedQuote(request: IcUsdQuoteRequest) {
    const { chainId, inputToken, isMinting, outputToken } = request
    const indexTokenAmount = BigNumber.from(request.indexTokenAmount)
    const indexToken = isMinting ? outputToken : inputToken
    const inputOutputToken = isMinting ? inputToken : outputToken
    const wrappedQuoteProvider = new WrappedQuoteProvider(
      this.rpcUrl,
      this.swapQuoteProvider,
    )
    const wrappedQuote = await wrappedQuoteProvider.getQuote({
      ...request,
      chainId,
      indexTokenAmount,
    })
    if (!wrappedQuote) return null
    const builder = new WrappedTransactionBuilder(this.rpcUrl)
    const txRequest: FlashMintWrappedBuildRequest = {
      chainId,
      isMinting,
      indexToken: indexToken.address,
      indexTokenAmount,
      inputOutputToken: inputOutputToken.address,
      inputOutputTokenSymbol: inputOutputToken.symbol,
      inputOutputTokenAmount: wrappedQuote.inputOutputTokenAmount,
      componentSwapData: wrappedQuote.componentSwapData,
      componentWrapData: wrappedQuote.componentWrapData,
    }
    const tx = await builder.build(txRequest)
    if (!tx) return null
    return buildQuoteResponse(
      request,
      chainId,
      FlashMintContractType.wrapped,
      wrappedQuote.inputOutputTokenAmount,
      tx,
    )
  }
}
