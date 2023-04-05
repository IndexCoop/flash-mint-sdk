import { FlashMintQuoteProvider } from 'quote'
import { WrappedQuoteProvider } from 'quote/wrapped'
import { getFlashMintWrappedContract } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  allowanceOf,
  balanceOf,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount2,
  transferFromWhale,
  wrapETH,
} from './utils'
import { BigNumber } from '@ethersproject/bignumber'
import { QuoteToken } from 'quote/quoteToken'

const provider = LocalhostProvider
const signer = SignerAccount2

const { dai, mmi, usdc, weth } = QuoteTokens

describe('MMI (mainnet)', () => {
  beforeAll(async () => {
    const flashMintContract = getFlashMintWrappedContract(signer)
    const approveSetTokenTX = await flashMintContract.approveSetToken(
      mmi.address
    )
    await approveSetTokenTX.wait()
  })

  beforeEach(async () => {
    jest.setTimeout(10000000)
  })

  test('can mint MMI from WETH (convenience)', async () => {
    await mintMMI(wei(1))
  })

  test('can mint MMI from DAI', async () => {
    await mintMMI_Erc20(
      dai,
      wei(1),
      '0x8ce71ef87582b28de89d14970d00b2377f93f32b'
    )
  })

  test('can mint MMI from USDC', async () => {
    await mintMMI_Erc20(
      usdc,
      wei(1),
      '0xE11f040179922e54f927D133A3663550568da77d'
    )
  })

  test.skip('can mint MMI from WETH (direct)', async () => {
    // Get quote
    const quoteRequest = {
      isMinting: true,
      inputToken: weth,
      outputToken: mmi,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const qp = new WrappedQuoteProvider(provider)
    const quote = await qp.getQuote(quoteRequest)
    if (!quote) fail()
    expect(quote).toBeDefined()

    const contract = getFlashMintWrappedContract(signer)
    console.log(contract.address, 'contract')
    const { inputOutputTokenAmount } = quote

    await wrapETH(inputOutputTokenAmount, signer)
    await approveErc20(
      weth.address,
      contract.address,
      inputOutputTokenAmount,
      signer
    )
    const allo = await allowanceOf(weth.address, contract.address, signer)
    console.log(allo.toString())

    const balanceBefore = await balanceOf(signer, mmi.address)
    console.log(balanceBefore.toString(), 'MMI balance before')

    // Estimate gas
    const gasEstimate = await contract.estimateGas.issueExactSetFromERC20(
      mmi.address,
      weth.address,
      quote.indexTokenAmount,
      quote.inputOutputTokenAmount, // _maxAmountInputToken
      quote.componentSwapData,
      quote.componentWrapData
    )
    console.log(gasEstimate.toString(), 'gasEstimate')

    const tx = await contract.issueExactSetFromERC20(
      mmi.address,
      weth.address,
      quote.indexTokenAmount,
      quote.inputOutputTokenAmount, // _maxAmountInputToken
      quote.componentSwapData,
      quote.componentWrapData,
      { gasLimit: gasEstimate }
    )
    tx.wait()

    const balanceAfter = await balanceOf(signer, mmi.address)
    console.log(balanceAfter.toString(), 'MMI balance after')
    expect(balanceAfter.gte(balanceBefore.add(inputOutputTokenAmount))).toBe(
      true
    )
  })

  test.skip('can redeem MMI for USDC', async () => {
    const flashMintContract = getFlashMintWrappedContract(signer)
    const approveSetTokenTX = await flashMintContract.approveSetToken(
      mmi.address
    )
    await approveSetTokenTX.wait()
    const indexTokenAmount = wei(1)
    const outputToken = usdc

    // Mint MMI for having funds to redeem
    await mintMMI(indexTokenAmount)

    // Get quote
    const quoteRequest = {
      isMinting: false,
      inputToken: mmi,
      outputToken,
      indexTokenAmount,
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(quoteRequest)
    if (!quote) fail()
    expect(quote.inputToken).toEqual(mmi)
    expect(quote.indexTokenAmount).toEqual(indexTokenAmount)
    expect(quote.inputOutputAmount.gt(0)).toBe(true)
    expect(quote.slippage).toEqual(quoteRequest.slippage)
    expect(quote.tx).toBeDefined()

    console.log(indexTokenAmount.toString(), quote.inputOutputAmount.toString())

    const { contract, tx } = quote

    // Approve spending MMI
    await approveErc20(mmi.address, contract, indexTokenAmount, signer)

    // Balance before
    const balanceBefore = await balanceOf(signer, outputToken.address)
    console.log(balanceBefore.toString(), 'balanceBefore')

    // Estimate gas
    const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = gasEstimate.mul(120).div(100)
    console.log(gasEstimate.toString())

    // Redeem index
    const resp = await signer.sendTransaction(tx)
    if (!resp) fail()
    resp.wait()

    // Balance after
    const balance = await balanceOf(signer, outputToken.address)
    console.log(balance.toString(), 'balance')
    expect(balance.sub(balanceBefore).gte(quote.inputOutputAmount)).toBe(true)
  })
})

async function getMintQuote(
  inputToken: QuoteToken,
  indexTokenAmount: BigNumber
) {
  const quoteRequest = {
    isMinting: true,
    inputToken,
    outputToken: mmi,
    indexTokenAmount,
    slippage: 0.5,
  }
  const quoteProvider = new FlashMintQuoteProvider(provider)
  const quote = await quoteProvider.getQuote(quoteRequest)
  return quote
}

async function mintMMI_Erc20(
  inputToken: QuoteToken,
  amount: BigNumber,
  whale: string
) {
  // Get quote
  const quote = await getMintQuote(inputToken, amount)
  if (!quote) fail()

  const { contract, indexTokenAmount, inputOutputAmount, tx } = quote

  await transferFromWhale(
    whale,
    signer.address,
    wei(1000, inputToken.decimals),
    inputToken.address,
    provider
  )
  await approveErc20(inputToken.address, contract, inputOutputAmount, signer)
  const balanceBefore = await balanceOf(signer, mmi.address)

  // Estimate gas
  const gasLimit = await signer.estimateGas(tx)
  tx.gasLimit = gasLimit.mul(120).div(100)

  // Mint index
  const resp = await signer.sendTransaction(tx)
  if (!resp) fail()
  resp.wait()

  const balanceAfter = await balanceOf(signer, mmi.address)
  expect(balanceAfter.gte(balanceBefore.add(indexTokenAmount))).toBe(true)
}

async function mintMMI(amount: BigNumber) {
  // Get quote
  const quote = await getMintQuote(weth, wei(1))
  if (!quote) fail()

  const { contract, inputOutputAmount, tx } = quote
  await wrapETH(inputOutputAmount, signer)
  await approveErc20(weth.address, contract, inputOutputAmount, signer)
  const balanceBefore = await balanceOf(signer, mmi.address)

  // Estimate gas
  const gasLimit = await signer.estimateGas(tx)
  tx.gasLimit = gasLimit.mul(120).div(100)

  // Mint index
  const resp = await signer.sendTransaction(tx)
  if (!resp) fail()
  resp.wait()

  const balanceAfter = await balanceOf(signer, mmi.address)
  console.log(balanceAfter.toString(), 'MMI balance after')
  expect(balanceAfter.gte(balanceBefore.add(inputOutputAmount))).toBe(true)
}
