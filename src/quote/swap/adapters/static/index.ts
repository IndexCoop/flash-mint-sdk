import { BigNumber } from '@ethersproject/bignumber'
import { getQuote } from 'quote/swap/adapters/static/quote'
import { getSwapData } from 'quote/swap/adapters/static/swap-data'
import { slippageAdjustedTokenAmount } from 'utils'

import type { QuoteToken } from 'quote/interfaces'
import type { Address } from 'viem'

export interface StaticProviderQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  // TODO: change to input/output amount
  indexTokenAmount: bigint
  inputAmount: bigint
  slippage: number
  taker: string
}

export interface StaticSwapQuoteProviderQuote {
  chainId: number
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: string
  outputAmount: string
  slippage: number
  // TODO:
  //   swapData: SwapDataV2 | null
}

export class StaticSwapQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  async getSwapQuote(
    request: StaticProviderQuoteRequest,
  ): Promise<StaticSwapQuoteProviderQuote | null> {
    const {
      chainId,
      indexTokenAmount,
      // TODO: use when doing static contract call
      inputAmount: maxInputAmount,
      inputToken,
      isMinting,
      outputToken,
      slippage,
      taker,
    } = request

    const indexToken = isMinting ? outputToken : inputToken

    const swapData = getSwapData(request)

    const quoteAmount = await getQuote(
      isMinting,
      indexToken.address as Address,
      indexTokenAmount,
      swapData.swapDataDebtForCollateral,
      swapData.swapDataInputToken,
      chainId,
      this.rpcUrl,
    )

    const inputOutputAmount = slippageAdjustedTokenAmount(
      BigNumber.from(quoteAmount.toString()),
      isMinting ? inputToken.decimals : outputToken.decimals,
      slippage,
      isMinting,
    ).toBigInt()

    const inputAmount = (
      isMinting ? inputOutputAmount : indexTokenAmount
    ).toString()
    const outputAmount = (
      isMinting ? indexTokenAmount : inputOutputAmount
    ).toString()

    return {
      chainId,
      inputToken,
      outputToken,
      inputAmount,
      outputAmount,
      slippage,
      // TODO: add call data encoded for issue/redeem function?
    }
  }
}
