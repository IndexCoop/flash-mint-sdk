import { BigNumber } from '@ethersproject/bignumber'
import { getQuote } from 'quote/swap/adapters/static/quote'
import { getSwapData } from 'quote/swap/adapters/static/swap-data'
import { buildTransaction } from 'quote/swap/adapters/static/transaction'
import { slippageAdjustedTokenAmount } from 'utils'

import type { QuoteToken } from 'quote/interfaces'
import type { Address, TransactionRequest } from 'viem'

export interface StaticQuoteRequest {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: bigint
  outputAmount: bigint
  slippage: number
}

export interface StaticQuoteProviderQuote {
  chainId: number
  isMinting: boolean
  inputToken: QuoteToken
  outputToken: QuoteToken
  inputAmount: string
  outputAmount: string
  quoteAmount: string
  slippage: number
  tx: TransactionRequest
}

export class StaticQuoteProvider {
  constructor(readonly rpcUrl: string) {}

  async getQuote(
    request: StaticQuoteRequest,
  ): Promise<StaticQuoteProviderQuote | null> {
    const {
      chainId,
      inputAmount: maxInputAmount,
      inputToken,
      isMinting,
      outputToken,
      slippage,
    } = request

    const indexToken = isMinting ? outputToken : inputToken
    const indexTokenAmount = isMinting
      ? request.outputAmount
      : request.inputAmount

    const entry = getSwapData(request)

    if (!entry) {
      console.error('Error fetching quote swap data')
      return null
    }

    const quoteAmountResult = await getQuote(
      isMinting,
      indexToken.address as Address,
      indexTokenAmount,
      maxInputAmount,
      entry,
      chainId,
      this.rpcUrl,
    )

    if (!quoteAmountResult.success) {
      console.error(
        `Error fetching quote: ${quoteAmountResult.error.message}`,
        quoteAmountResult.error.originalError,
      )
      return null
    }

    const quoteAmount = quoteAmountResult.data

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

    // Pass the original request through (with the user's maxIn / setAmount).
    // Legacy leveraged contracts encode `request.inputAmount` directly as
    // _maxAmountInputToken; dexV5 uses it as PaymentInfo.limitAmt. In both
    // cases we want the *user's headline max*, not the slippage-adjusted
    // quote — overriding here would (a) tighten the on-chain limit
    // unnecessarily and (b) break the e2e test's `tx.data.includes(req.inputTokenAmount)`
    // substring check that all the leveraged-product specs rely on.
    // The slippage-adjusted amount is still surfaced via the returned
    // `inputAmount`/`outputAmount` strings below and via `inputOutputAmount`
    // (4th arg, used as the redeem-side min-output bound in tx encoding).
    const tx = buildTransaction(request, entry, inputOutputAmount)

    return {
      chainId,
      isMinting,
      inputToken,
      outputToken,
      inputAmount,
      outputAmount,
      quoteAmount: quoteAmount.toString(),
      slippage,
      tx,
    }
  }
}
