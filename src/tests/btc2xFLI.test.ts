/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTransactionBuilder } from 'flashmint/builders'
import { LeveragedQuoteProvider } from 'quote/leveraged'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  createERC20Contract,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount2,
  ZeroExApiSwapQuote,
} from './utils'

const slippage = 1

const provider = LocalhostProvider
const signer = SignerAccount2
const zeroExApi = ZeroExApiSwapQuote

const { btc2xfli, eth, usdc } = QuoteTokens

describe('BTC2xFLI (mainnet)', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint BTC2xFLI', async () => {
    const isMinting = true
    const indexTokenAmount = wei('2')
    // Get quote
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote({
      inputToken: eth,
      outputToken: btc2xfli,
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

    const erc20OutputToken = createERC20Contract(btc2xfli.address, signer)
    const balanceBefore: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )

    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build({
      isMinting,
      indexToken: btc2xfli.address,
      indexTokenSymbol: btc2xfli.symbol,
      inputOutputToken: eth.address,
      inputOutputTokenSymbol: eth.symbol,
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
    const balanceAfter: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    expect(balanceAfter.gte(balanceBefore.add(indexTokenAmount))).toBe(true)
  })

  test('can redeem BTC2xFLI', async () => {
    const isMinting = false
    const indexTokenAmount = wei('1')
    // Get quote
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote({
      inputToken: btc2xfli,
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

    const erc20OutputToken = createERC20Contract(btc2xfli.address, signer)
    const balanceBefore: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )

    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build({
      isMinting,
      indexToken: btc2xfli.address,
      indexTokenSymbol: btc2xfli.symbol,
      inputOutputToken: eth.address,
      inputOutputTokenSymbol: eth.symbol,
      indexTokenAmount,
      inputOutputTokenAmount: quote.inputOutputTokenAmount,
      swapDataDebtCollateral: quote.swapDataDebtCollateral,
      swapDataPaymentToken: quote.swapDataPaymentToken,
    })
    if (!tx) fail()

    await approveErc20(
      btc2xfli.address,
      tx.to!, // FlashMint contract
      indexTokenAmount,
      signer
    )

    // Gas estimation fails but tx goes through
    // const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = 5_000_000
    const res = await signer.sendTransaction(tx)
    res.wait()
    const balanceAfter: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    expect(balanceAfter.lte(balanceBefore.sub(indexTokenAmount))).toBe(true)
  })

  test('can redeem BTC2xFLI for ERC20', async () => {
    const isMinting = false
    const indexTokenAmount = wei('1')
    const outputToken = usdc
    // Get quote
    const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
    const quote = await quoteProvider.getQuote({
      inputToken: btc2xfli,
      outputToken,
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

    const erc20OutputToken = createERC20Contract(btc2xfli.address, signer)
    const balanceBefore: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )

    const builder = new LeveragedTransactionBuilder(provider)
    const tx = await builder.build({
      isMinting,
      indexToken: btc2xfli.address,
      indexTokenSymbol: btc2xfli.symbol,
      inputOutputToken: outputToken.address,
      inputOutputTokenSymbol: outputToken.symbol,
      indexTokenAmount,
      inputOutputTokenAmount: quote.inputOutputTokenAmount,
      swapDataDebtCollateral: quote.swapDataDebtCollateral,
      swapDataPaymentToken: quote.swapDataPaymentToken,
    })
    if (!tx) fail()

    await approveErc20(
      btc2xfli.address,
      tx.to!, // FlashMint contract
      indexTokenAmount,
      signer
    )

    // Gas estimation fails but tx goes through
    // const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = 5_000_000
    const res = await signer.sendTransaction(tx)
    res.wait()
    const balanceAfter: BigNumber = await erc20OutputToken.balanceOf(
      signer.address
    )
    expect(balanceAfter.lte(balanceBefore.sub(indexTokenAmount))).toBe(true)
  })
})
