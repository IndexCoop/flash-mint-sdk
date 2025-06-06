import { JsonRpcProvider } from '@ethersproject/providers'
import { FlashMintQuoteProvider } from 'quote'
import { approveErc20, balanceOf, getAlchemyProviderUrl } from './'

import type { BigNumber } from '@ethersproject/bignumber'
import type { Wallet } from '@ethersproject/wallet'

import type {
  FlashMintQuote,
  FlashMintQuoteRequest,
  SwapQuoteProviderV2,
} from 'quote'

class TxTestFactory {
  constructor(
    readonly provider: JsonRpcProvider,
    readonly signer: Wallet,
  ) {}

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
        signer,
      )
    }
    // Automatically adding from as it seems like estimateGas won't recognize
    // the impersonated balance if `from` is not set.
    tx.from = this.signer.address
    const gasEstimate = await this.provider.estimateGas(tx)
    tx.gasLimit = gasEstimate
    const res = await signer.sendTransaction(tx)
    await res.wait()
    const balanceAfter: BigNumber = await balanceOf(signer, indexToken.address)
    expect(balanceAfter.gte(balanceBefore.add(quote.indexTokenAmount))).toBe(
      true,
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
      signer,
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
    await res.wait()
    const balanceAfter: BigNumber = await balanceOf(signer, indexToken.address)
    expect(balanceAfter.lte(balanceBefore.sub(quote.indexTokenAmount))).toBe(
      true,
    )
  }
}

export class TestFactory {
  quote: FlashMintQuote | null = null
  private quoteProvider: FlashMintQuoteProvider
  private txFactory: TxTestFactory
  constructor(
    rpcUrl: string,
    signer: Wallet,
    swapQuoteProviderV2: SwapQuoteProviderV2,
    swapQuoteOutputProviderV2?: SwapQuoteProviderV2,
  ) {
    const provider = new JsonRpcProvider(rpcUrl)
    this.quoteProvider = new FlashMintQuoteProvider(
      rpcUrl,
      swapQuoteProviderV2,
      swapQuoteOutputProviderV2,
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

  async fetchQuote(config: FlashMintQuoteRequest): Promise<FlashMintQuote> {
    const quoteResult = await this.quoteProvider.getQuote(config)
    expect(quoteResult.success).toBe(true)
    if (!quoteResult.success) fail()
    const quote = quoteResult.data
    expect(quote.isMinting).toEqual(config.isMinting)
    expect(quote.indexTokenAmount.toString()).toEqual(config.indexTokenAmount)
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

  async getBlockNumber(): Promise<number> {
    const provider = this.getProvider()
    const blockNumber = await provider.getBlockNumber()
    return blockNumber
  }

  async resetFork(chainId: number) {
    const alchemyUrl = getAlchemyProviderUrl(chainId)
    const localHostProvider = this.getProvider()
    // Reset fork to latest block to ensure accurate quote
    await localHostProvider.send('hardhat_reset', [
      {
        forking: { jsonRpcUrl: alchemyUrl },
      },
    ])
  }
}
