import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Wallet } from '@ethersproject/wallet'

import { FlashMintQuote, FlashMintQuoteProvider, QuoteToken } from 'quote'

import { ZeroExApi } from 'utils'
import { balanceOf } from './utils'

class TxTestFactory {
  constructor(
    private readonly provider: JsonRpcProvider,
    private readonly signer: Wallet
  ) {}

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

  async executeTx() {
    if (!this.quote) fail()
    // TODO: add check for isMinting and redeem on else
    await this.txFactory.testMinting(this.quote)
  }
}
