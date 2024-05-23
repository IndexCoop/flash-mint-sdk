import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

import {
  FlashMintQuote,
  FlashMintQuoteProvider,
  QuoteToken,
  SwapQuoteProvider,
} from 'quote'

import { ZeroExApi } from 'utils'
import { approveErc20, balanceOf } from './'

class TxTestFactory {
  constructor(readonly provider: JsonRpcProvider, readonly signer: Wallet) {}

  /**
   * Tests minting a given flash mint quote.
   * @param quote a flash mint quote
   */
  async testMinting(quote: FlashMintQuote) {
    const { signer } = this
    const indexToken = quote.outputToken
    const tx = quote.tx
    if (!tx) fail()
    const balanceBefore: BigNumber = await balanceOf(signer, indexToken.address)
    if (quote.inputToken.symbol !== 'ETH') {
      await approveErc20(
        quote.inputToken.address,
        quote.contract,
        quote.inputOutputAmount,
        signer
      )
    }
    // Automatically adding from as it seems like estimateGas won't recognize
    // the impersonated balance if `from` is not set.
    tx.from = this.signer.address
    const gasEstimate = await this.provider.estimateGas(tx)
    tx.gasLimit = gasEstimate
    const res = await signer.sendTransaction(tx)
    res.wait()
    const balanceAfter: BigNumber = await balanceOf(signer, indexToken.address)
    expect(balanceAfter.gte(balanceBefore.add(quote.indexTokenAmount))).toBe(
      true
    )
  }

  /**
   * Tests redeeming a given flash mint quote.
   * @param quote a flash mint quote
   * @param gasLimit override gas limit
   */
  async testRedeeming(quote: FlashMintQuote, gasLimit?: BigNumber) {
    const { signer } = this
    const indexToken = quote.inputToken
    const balanceBefore: BigNumber = await balanceOf(signer, indexToken.address)
    await approveErc20(
      indexToken.address,
      quote.contract,
      quote.indexTokenAmount,
      signer
    )
    const tx = quote.tx
    if (!tx) fail()
    // Automatically, adding from as it seems like estimateGas won't recognize
    // the impersonated balance if `from` is not set.
    tx.from = this.signer.address
    tx.gasLimit = gasLimit
    if (!gasLimit) {
      const gasEstimate = await this.provider.estimateGas(tx)
      tx.gasLimit = gasEstimate
    }
    const res = await signer.sendTransaction(tx)
    res.wait()
    const balanceAfter: BigNumber = await balanceOf(signer, indexToken.address)
    expect(balanceAfter.lte(balanceBefore.sub(quote.indexTokenAmount))).toBe(
      true
    )
  }
}

export class TestFactory {
  private quote: FlashMintQuote | null = null
  private quoteProvider: FlashMintQuoteProvider
  private txFactory: TxTestFactory
  constructor(
    provider: JsonRpcProvider,
    signer: Wallet,
    swapQuoteProvider: SwapQuoteProvider,
    zeroExApi: ZeroExApi
  ) {
    this.quoteProvider = new FlashMintQuoteProvider(
      provider,
      swapQuoteProvider,
      zeroExApi
    )
    this.txFactory = new TxTestFactory(provider, signer)
  }

  async executeTx(gasLimit?: BigNumber) {
    if (!this.quote) fail()
    if (this.quote.isMinting) {
      await this.txFactory.testMinting(this.quote)
      return
    }
    await this.txFactory.testRedeeming(this.quote, gasLimit)
  }

  async fetchQuote(config: {
    inputToken: QuoteToken
    outputToken: QuoteToken
    indexTokenAmount: BigNumber
    isMinting: boolean
    slippage: number
  }): Promise<FlashMintQuote> {
    const quote = await this.quoteProvider.getQuote(config)
    expect(quote).toBeDefined()
    if (!quote) fail()
    expect(quote.isMinting).toEqual(config.isMinting)
    expect(quote.indexTokenAmount).toEqual(config.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    this.quote = quote
    return quote
  }

  getProvider(): JsonRpcProvider {
    return this.txFactory.provider
  }

  getSigner(): Wallet {
    return this.txFactory.signer
  }
}
