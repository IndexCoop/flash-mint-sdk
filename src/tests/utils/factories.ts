import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

import { FlashMintQuote, FlashMintQuoteProvider, QuoteToken } from 'quote'

import { ZeroExApi } from 'utils'
import { approveErc20, balanceOf } from './'

class TxTestFactory {
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly signer: Wallet
  ) {}

  /**
   * Tests minting a given flash mint quote.
   * @param quote a flash mint quote
   */
  async testMinting(quote: FlashMintQuote) {
    const { signer } = this
    const indexToken = quote.outputToken
    const balanceBefore: BigNumber = await balanceOf(signer, indexToken.address)
    const tx = quote.tx
    if (!tx) fail()
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
    tx.gasLimit = gasLimit
    if (!tx) fail()
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
  constructor(provider: JsonRpcProvider, signer: Wallet, zeroExApi: ZeroExApi) {
    this.quoteProvider = new FlashMintQuoteProvider(provider, zeroExApi)
    this.txFactory = new TxTestFactory(provider, signer)
  }

  async fetchQuote(config: {
    inputToken: QuoteToken
    outputToken: QuoteToken
    indexTokenAmount: BigNumber
    isMinting: boolean
    slippage: number
  }) {
    const quote = await this.quoteProvider.getQuote(config)
    expect(quote).toBeDefined()
    if (!quote) fail()
    expect(quote.isMinting).toEqual(config.isMinting)
    expect(quote.indexTokenAmount).toEqual(config.indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    this.quote = quote
  }

  async executeTx(gasLimit?: BigNumber) {
    if (!this.quote) fail()
    if (this.quote.isMinting) {
      await this.txFactory.testMinting(this.quote)
      return
    }
    console.log('RDEEMQUOTE', this.quote)
    await this.txFactory.testRedeeming(this.quote, gasLimit)
  }
}
