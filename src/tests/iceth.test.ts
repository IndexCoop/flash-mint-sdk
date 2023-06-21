import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTransactionBuilder } from 'flashmint/builders'
import { LeveragedQuoteProvider } from 'quote/leveraged'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  balanceOf,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount4,
  ZeroExApiSwapQuote,
} from './utils'

const { eth, iceth, usdc } = QuoteTokens

const setToken = iceth
const setTokenAddress = iceth.address
const zeroExApi = ZeroExApiSwapQuote
const provider = LocalhostProvider
const signer = SignerAccount4

describe('icETH (mainnet)', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint icETH-ETH', async () => {
    const isMinting = true
    const indexTokenAmount = wei('1')
    const slippage = 0.5
    // Get quote
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote({
      inputToken: eth,
      outputToken: setToken,
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

    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build({
      isMinting,
      indexToken: setToken.address,
      indexTokenSymbol: setToken.symbol,
      inputOutputToken: eth.address,
      inputOutputTokenSymbol: eth.symbol,
      indexTokenAmount,
      inputOutputTokenAmount: quote.inputOutputTokenAmount,
      swapDataDebtCollateral: quote.swapDataDebtCollateral,
      swapDataPaymentToken: quote.swapDataPaymentToken,
    })
    if (!tx) fail()
    const balanceBefore = await balanceOf(signer, setTokenAddress)
    const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = gasEstimate
    const res = await signer.sendTransaction(tx)
    res.wait()
    const balanceAfter = await balanceOf(signer, setTokenAddress)
    expect(balanceAfter.gte(balanceBefore.add(indexTokenAmount))).toBe(true)
  })

  test('can redeem ETH', async () => {
    const isMinting = false
    const indexTokenAmount = wei('1')
    const slippage = 0.5
    // Get quote
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote({
      inputToken: setToken,
      outputToken: eth,
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

    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build({
      isMinting,
      indexToken: setToken.address,
      indexTokenSymbol: setToken.symbol,
      inputOutputToken: eth.address,
      inputOutputTokenSymbol: eth.symbol,
      indexTokenAmount,
      inputOutputTokenAmount: quote.inputOutputTokenAmount,
      swapDataDebtCollateral: quote.swapDataDebtCollateral,
      swapDataPaymentToken: quote.swapDataPaymentToken,
    })
    if (!tx) fail()
    const balanceBefore = await balanceOf(signer, setTokenAddress)
    approveErc20(
      setTokenAddress,
      /* eslint-disable  @typescript-eslint/no-non-null-assertion */
      tx.to!,
      indexTokenAmount,
      signer
    )
    // Gas estimation fails but tx goes through
    // const gasEstimate = await provider.estimateGas(tx)
    // tx.gasLimit = gasEstimate
    tx.gasLimit = 5_000_000
    const nonce = (await signer.getTransactionCount()) + 1
    tx.nonce = BigNumber.from(nonce)
    const res = await signer.sendTransaction(tx)
    res.wait()
    const balanceAfter = await balanceOf(signer, setTokenAddress)
    expect(balanceAfter.lte(balanceBefore.sub(indexTokenAmount))).toBe(true)
  })
})
