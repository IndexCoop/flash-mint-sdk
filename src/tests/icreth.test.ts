/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTransactionBuilder } from 'flashmint/builders'
import { LeveragedQuoteProvider } from 'quote/leveraged'
import { wei } from 'utils/numbers'

import {
  balanceOf,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount2,
  ZeroExApiSwapQuote,
} from './utils'

const slippage = 0.1

const provider = LocalhostProvider
const signer = SignerAccount2
const zeroExApi = ZeroExApiSwapQuote

// FIXME: add tests for all tokens (mint + redeem)
const { eth, icreth, reth, usdc, weth } = QuoteTokens
const indexToken = icreth

describe('icRETH (mainnet)', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint icRETH-rETH', async () => {
    const inputToken = reth
    const isMinting = true
    const indexTokenAmount = wei('1')
    // Get quote
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote({
      inputToken,
      outputToken: indexToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
    if (!quote) fail()
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()

    const balanceBefore: BigNumber = await balanceOf(signer, indexToken.address)

    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build({
      isMinting,
      indexToken: indexToken.address,
      indexTokenSymbol: indexToken.symbol,
      inputOutputToken: inputToken.address,
      inputOutputTokenSymbol: inputToken.symbol,
      indexTokenAmount,
      inputOutputTokenAmount: quote.inputOutputTokenAmount,
      swapDataDebtCollateral: quote.swapDataDebtCollateral,
      swapDataPaymentToken: quote.swapDataPaymentToken,
    })
    if (!tx) fail()
    const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = gasEstimate
    const res = await signer.sendTransaction(tx)
    res.wait()
    const balanceAfter: BigNumber = await balanceOf(signer, indexToken.address)
    expect(balanceAfter.gte(balanceBefore.add(indexTokenAmount))).toBe(true)
  })
})
