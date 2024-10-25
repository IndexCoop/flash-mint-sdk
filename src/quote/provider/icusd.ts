import { BigNumber } from '@ethersproject/bignumber'

import { FlashMintNavTransactionBuilder } from 'flashmint/builders/nav'

import { FlashMintNavQuoteProvider } from '../flashmint/nav'
import { QuoteProvider, QuoteToken } from '../interfaces'
import {
  FlashMintContractType,
  FlashMintQuote,
  FlashMintQuoteRequest,
} from '../provider'
import { SwapQuoteProvider } from '../swap'
import { buildQuoteResponse } from './utils'

export interface IcUsdQuoteRequest extends FlashMintQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  indexTokenAmount: BigNumber
  // FlashMintNav always needs the input amount
  inputTokenAmount: BigNumber
  slippage: number
}

export class IcUsdQuoteRouter
  implements QuoteProvider<IcUsdQuoteRequest, FlashMintQuote>
{
  constructor(
    private readonly rpcUrl: string,
    private readonly swapQuoteProvider: SwapQuoteProvider
  ) {}

  async getQuote(request: IcUsdQuoteRequest): Promise<FlashMintQuote | null> {
    if (request.isMinting) {
      return await this.getFlashMintNavQuote(request)
    } else {
      // TODO:
      return null
    }
  }

  private async getFlashMintNavQuote(request: IcUsdQuoteRequest) {
    const { chainId, inputToken, isMinting, outputToken } = request
    const flashMintNavQuoteProvider = new FlashMintNavQuoteProvider(
      this.rpcUrl,
      this.swapQuoteProvider
    )
    const fmNavQuote = await flashMintNavQuoteProvider.getQuote({
      ...request,
    })
    if (!fmNavQuote) return null
    const builder = new FlashMintNavTransactionBuilder(this.rpcUrl)
    const txRequest = {
      isMinting,
      inputToken: inputToken.address,
      inputTokenSymbol: inputToken.symbol,
      outputToken: outputToken.address,
      outputTokenSymbol: outputToken.symbol,
      inputTokenAmount: fmNavQuote.inputTokenAmount,
      outputTokenAmount: fmNavQuote.outputTokenAmount,
      reserveAssetSwapData: fmNavQuote.reserveAssetSwapData,
    }
    const tx = await builder.build(txRequest)
    if (!tx) return null
    return buildQuoteResponse(
      request,
      chainId,
      FlashMintContractType.nav,
      isMinting ? fmNavQuote.inputTokenAmount : fmNavQuote.outputTokenAmount,
      tx
    )
  }
}
