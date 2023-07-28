import { BigNumber } from '@ethersproject/bignumber'

import { LeveragedTransactionBuilder } from 'flashmint/builders'
import { QuoteToken } from 'quote'
import {
  FlashMintLeveragedQuote,
  LeveragedQuoteProvider,
} from 'quote/leveraged'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  balanceOf,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount2,
  transferFromWhale,
  wrapETH,
  ZeroExApiSwapQuote,
} from './utils'

const slippage = 0.1

const provider = LocalhostProvider
const signer = SignerAccount2
const zeroExApi = ZeroExApiSwapQuote

const { eth, icreth, reth, usdc, weth } = QuoteTokens
const indexToken = icreth

async function mint(
  inputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  quote: FlashMintLeveragedQuote
) {
  const balanceBefore: BigNumber = await balanceOf(signer, indexToken.address)
  const builder = new LeveragedTransactionBuilder(provider)
  if (!quote) throw new Error('No quote provided')
  const tx = await builder.build({
    isMinting: true,
    indexToken: indexToken.address,
    indexTokenSymbol: indexToken.symbol,
    inputOutputToken: inputToken.address,
    inputOutputTokenSymbol: inputToken.symbol,
    indexTokenAmount,
    inputOutputTokenAmount: quote.inputOutputTokenAmount,
    swapDataDebtCollateral: quote.swapDataDebtCollateral,
    swapDataPaymentToken: quote.swapDataPaymentToken,
  })
  if (!tx || !tx.to) fail()
  await approveErc20(inputToken.address, tx.to, wei(100), signer)
  const gasEstimate = await signer.estimateGas(tx)
  tx.gasLimit = gasEstimate
  const res = await signer.sendTransaction(tx)
  await res.wait()
  const balanceAfter: BigNumber = await balanceOf(signer, indexToken.address)
  expect(balanceAfter.gte(balanceBefore.add(indexTokenAmount))).toBe(true)
}

async function redeem(
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  quote: FlashMintLeveragedQuote
) {
  const balanceBefore: BigNumber = await balanceOf(signer, indexToken.address)
  const builder = new LeveragedTransactionBuilder(provider)
  if (!quote) throw new Error('No quote provided')
  const tx = await builder.build({
    isMinting: false,
    indexToken: indexToken.address,
    indexTokenSymbol: indexToken.symbol,
    inputOutputToken: outputToken.address,
    inputOutputTokenSymbol: outputToken.symbol,
    indexTokenAmount,
    inputOutputTokenAmount: quote.inputOutputTokenAmount,
    swapDataDebtCollateral: quote.swapDataDebtCollateral,
    swapDataPaymentToken: quote.swapDataPaymentToken,
  })
  if (!tx || !tx.to) fail()
  await approveErc20(indexToken.address, tx.to, indexTokenAmount, signer)
  const gasEstimate = await signer.estimateGas(tx)
  tx.gasLimit = gasEstimate
  const res = await signer.sendTransaction(tx)
  await res.wait()
  const balanceAfter: BigNumber = await balanceOf(signer, indexToken.address)
  expect(balanceAfter.lte(balanceBefore.sub(indexTokenAmount))).toBe(true)
}

describe('icRETH (mainnet) - ETH', () => {
  let quote: Awaited<
    ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>
  >
  const inputToken = eth
  const isMinting = true
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeEach(async () => {
    // Get quote
    quote = await quoteProvider.getQuote({
      inputToken,
      outputToken: indexToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

  test('can mint icRETH from ETH', async () => {
    if (!quote) throw new Error('No quote provided')
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    await mint(inputToken, indexTokenAmount, quote)
  })
})

describe('icRETH (mainnet) - rETH', () => {
  const rethWhale = '0x7d6149aD9A573A6E2Ca6eBf7D4897c1B766841B4'
  let quote: Awaited<
    ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>
  >
  const inputToken = reth
  const isMinting = true
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeAll(async () => {
    await transferFromWhale(
      rethWhale,
      signer.address,
      wei(100),
      inputToken.address,
      provider
    )
  })
  beforeEach(async () => {
    // Get quote
    quote = await quoteProvider.getQuote({
      inputToken,
      outputToken: indexToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

  test('can mint icRETH from rETH', async () => {
    if (!quote) throw new Error('No quote provided')
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    await mint(inputToken, indexTokenAmount, quote)
  })
})

describe('icRETH (mainnet) - USDC', () => {
  const usdcWhale = '0x7713974908Be4BEd47172370115e8b1219F4A5f0'
  let quote: Awaited<
    ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>
  >
  const inputToken = usdc
  const isMinting = true
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeAll(async () => {
    await transferFromWhale(
      usdcWhale,
      signer.address,
      wei(5000, 6),
      inputToken.address,
      provider
    )
  })

  beforeEach(async () => {
    // Get quote
    quote = await quoteProvider.getQuote({
      inputToken,
      outputToken: indexToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

  test('can mint icRETH from USDC', async () => {
    if (!quote) throw new Error('No quote provided')
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    await mint(inputToken, indexTokenAmount, quote)
  })
})

describe('icRETH (mainnet) - WETH', () => {
  let quote: Awaited<
    ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>
  >
  const inputToken = weth
  const isMinting = true
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeAll(async () => {
    await wrapETH(wei(2), signer)
  })

  beforeEach(async () => {
    // Get quote
    quote = await quoteProvider.getQuote({
      inputToken,
      outputToken: indexToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

  test('can mint icRETH from WETH', async () => {
    if (!quote) throw new Error('No quote provided')
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    await mint(inputToken, indexTokenAmount, quote)
  })
})

describe('icRETH (mainnet) - redeem ETH', () => {
  let quote: Awaited<
    ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>
  >
  const outputToken = eth
  const isMinting = false
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeEach(async () => {
    // Get quote
    quote = await quoteProvider.getQuote({
      inputToken: indexToken,
      outputToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

  test('can redeem icRETH for ETH', async () => {
    if (!quote) throw new Error('No quote provided')
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    await redeem(outputToken, indexTokenAmount, quote)
  })
})

describe('icRETH (mainnet) - redeem rETH', () => {
  let quote: Awaited<
    ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>
  >
  const outputToken = reth
  const isMinting = false
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeEach(async () => {
    // Get quote
    quote = await quoteProvider.getQuote({
      inputToken: indexToken,
      outputToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

  test('can redeem icRETH for rETH', async () => {
    if (!quote) throw new Error('No quote provided')
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    await redeem(outputToken, indexTokenAmount, quote)
  })
})

describe('icRETH (mainnet) - redeem USDC', () => {
  let quote: Awaited<
    ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>
  >
  const outputToken = usdc
  const isMinting = false
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeEach(async () => {
    // Get quote
    quote = await quoteProvider.getQuote({
      inputToken: indexToken,
      outputToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

  test('can redeem icRETH for USDC', async () => {
    if (!quote) throw new Error('No quote provided')
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    await redeem(outputToken, indexTokenAmount, quote)
  })
})

describe('icRETH (mainnet) - redeem WETH', () => {
  let quote: Awaited<
    ReturnType<typeof LeveragedQuoteProvider.prototype.getQuote>
  >
  const outputToken = weth
  const isMinting = false
  const indexTokenAmount = wei('1')
  const quoteProvider = new LeveragedQuoteProvider(provider, zeroExApi)
  beforeEach(async () => {
    // Get quote
    quote = await quoteProvider.getQuote({
      inputToken: indexToken,
      outputToken,
      indexTokenAmount,
      isMinting,
      slippage,
    })
  })

  test('can redeem icRETH for WETH', async () => {
    if (!quote) throw new Error('No quote provided')
    expect(quote).toBeDefined()
    expect(quote.inputOutputTokenAmount.gt(0)).toBe(true)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.swapDataDebtCollateral).toBeDefined()
    expect(quote.swapDataPaymentToken).toBeDefined()
    await redeem(outputToken, indexTokenAmount, quote)
  })
})
