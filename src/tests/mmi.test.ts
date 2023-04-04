import { MoneyMarketIndex, USDC, WETH } from 'constants/tokens'
import { QuoteToken } from 'quote/quoteToken'
import { FlashMintQuoteProvider } from 'quote'
import { WrappedQuoteProvider } from 'quote/wrapped'
import { getFlashMintWrappedContract } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  allowanceOf,
  balanceOf,
  LocalhostProvider,
  SignerAccount2,
  transferFromWhale,
  wrapETH,
} from './utils'

const indexToken = MoneyMarketIndex
const indexTokenAddress = indexToken.address!

const provider = LocalhostProvider
const signer = SignerAccount2

const mmi: QuoteToken = {
  address: indexToken.address!,
  decimals: 18,
  symbol: indexToken.symbol,
}

const usdc: QuoteToken = {
  address: USDC.address!,
  decimals: 6,
  symbol: USDC.symbol,
}

const weth: QuoteToken = {
  address: WETH.address!,
  decimals: 18,
  symbol: WETH.symbol,
}

describe('MMI (mainnet)', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('can mint MMI from WETH (convenience)', async () => {
    // Get quote
    const quoteRequest = {
      isMinting: true,
      inputToken: weth,
      outputToken: mmi,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(quoteRequest)
    if (!quote) fail()
    expect(quote).toBeDefined()

    const { contract, inputOutputAmount } = quote
    console.log(quote.contract, 'contract')

    await wrapETH(inputOutputAmount, signer)
    await approveErc20(weth.address, quote.contract, inputOutputAmount, signer)
    const allo = await allowanceOf(weth.address, contract, signer)
    console.log(allo.toString())

    const balanceBefore = await balanceOf(signer, mmi.address)
    console.log(balanceBefore.toString(), 'MMI balance before')

    const { tx } = quote

    // TODO: check fails with `ERC20: insufficient allowance`
    // const gasLimit = await signer.estimateGas(tx)
    // tx.gasLimit = gasLimit
    // console.log(tx)

    // TODO: Mint index fails w/ `Address: low-level call with value failed`
    // if I just run with a default gas limit
    tx.gasLimit = 1_500_000
    const resp = await signer.sendTransaction(tx)
    if (!resp) fail()
    resp.wait()

    const balanceAfter = await balanceOf(signer, mmi.address)
    console.log(balanceAfter.toString(), 'MMI balance after')
    expect(balanceAfter.gte(balanceBefore.add(inputOutputAmount))).toBe(true)
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

    // TODO: check fails with `ERC20: insufficient allowance`
    // Estimate gas
    const gasEstimate = await contract.estimateGas.issueExactSetFromERC20(
      indexToken.address,
      weth.address,
      quote.indexTokenAmount,
      quote.inputOutputTokenAmount, // _maxAmountInputToken
      quote.componentSwapData,
      quote.componentWrapData
    )
    console.log(gasEstimate.toString(), 'gasEstimate')

    // TODO: Mint
    // const tx = await contract.issueExactSetFromERC20(
    //   indexToken.address,
    //   weth.address,
    //   quote.indexTokenAmount,
    //   quote.inputOutputTokenAmount, // _maxAmountInputToken
    //   quote.componentSwapData,
    //   quote.componentWrapData,
    //   { gasLimit: gasEstimate }
    // )
    // tx.wait()

    const balanceAfter = await balanceOf(signer, mmi.address)
    console.log(balanceAfter.toString(), 'MMI balance after')
    expect(balanceBefore.gte(balanceAfter.add(inputOutputTokenAmount))).toBe(
      true
    )
  })

  test.skip('can mint MMI from USDC', async () => {
    const inputToken = usdc
    // Get quote
    const quoteRequest = {
      isMinting: true,
      inputToken,
      outputToken: mmi,
      indexTokenAmount: wei(1),
      slippage: 0.5,
    }
    const quoteProvider = new FlashMintQuoteProvider(provider)
    const quote = await quoteProvider.getQuote(quoteRequest)
    if (!quote) fail()
    expect(quote).toBeDefined()

    const { contract, inputOutputAmount } = quote

    console.log(quote.contract, 'contract addr')

    const whale = '0xE11f040179922e54f927D133A3663550568da77d'
    await transferFromWhale(
      whale,
      signer.address,
      wei('1000', inputToken.decimals),
      inputToken.address,
      provider
    )
    const wethBalance = await balanceOf(signer, inputToken.address)
    console.log(wethBalance.toString(), inputOutputAmount.toString())
    await approveErc20(
      inputToken.address,
      contract,
      inputOutputAmount.mul(2),
      signer
    )
    const allo = await allowanceOf(inputToken.address, contract, signer)
    console.log(allo.toString(), 'allowance')

    const balanceBefore = await balanceOf(signer, mmi.address)
    console.log(balanceBefore.toString(), 'MMI balance before')

    const { tx } = quote
    tx.gasLimit = 2_500_000
    tx.from = signer.address
    console.log(tx)

    // Estimate gas
    const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = gasEstimate

    // Mint index
    const resp = await signer.sendTransaction(tx)
    if (!resp) fail()
    resp.wait()

    const balanceAfter = await balanceOf(signer, mmi.address)
    console.log(balanceAfter.toString(), 'MMI balance after')
    expect(balanceBefore.gte(balanceAfter.add(inputOutputAmount))).toBe(true)
  })

  // FIXME: run/test when we can mint MMI
  test.skip('can redeem MMI for USDC', async () => {
    const indexTokenAmount = wei(1)
    const outputToken = usdc
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

    // Approve spending MMI
    const contract = getFlashMintWrappedContract(signer)
    await approveErc20(mmi.address, contract.address, indexTokenAmount, signer)

    // Balance before
    const balanceBefore = await balanceOf(signer, outputToken.address)
    console.log(balanceBefore.toString(), 'balanceBefore')

    const { tx } = quote

    // Estimate gas
    const gasEstimate = await provider.estimateGas(tx)
    tx.gasLimit = gasEstimate

    // Redeem index
    const resp = await signer.sendTransaction(tx)
    if (!resp) fail()
    resp.wait()

    // Balance after
    const balance = await balanceOf(signer, outputToken.address)
    console.log(balance.toString(), 'balance')
    expect(balance.sub(balanceBefore).gt(quote.inputOutputAmount)).toBe(true)
  })
})
