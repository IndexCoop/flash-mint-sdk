import { BigNumber } from '@ethersproject/bignumber'

import { FlashMintQuoteProvider } from 'quote'
import { QuoteToken } from 'quote/quoteToken'
import { getFlashMint4626Contract } from 'utils/contracts'
import { wei } from 'utils/numbers'

import {
  approveErc20,
  balanceOf,
  LocalhostProvider,
  QuoteTokens,
  SignerAccount5,
  transferFromWhale,
  wrapETH,
} from './utils'

const provider = LocalhostProvider
const signer = SignerAccount5

const { dai, mmi, usdc, usdt, weth } = QuoteTokens

describe('MMI (mainnet)', () => {
  beforeAll(async () => {
    const flashMintContract = getFlashMint4626Contract(signer)
    const approveSetTokenTX = await flashMintContract.approveSetToken(
      mmi.address
    )
    await approveSetTokenTX.wait()
  })

  beforeEach(async () => {
    jest.setTimeout(10000000)
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

  test('can mint MMI from USDT', async () => {
    await mintMMI_Erc20(
      usdt,
      wei(1),
      '0x06d3a30cBb00660B85a30988D197B1c282c6dCB6'
    )
  })

  test('can mint MMI from WETH', async () => {
    await mintMMI(wei(1))
  })

  test('can redeem MMI for DAI', async () => {
    await redeemMMI(wei(1), dai)
  })

  test('can redeem MMI for USDC', async () => {
    await redeemMMI(wei(1), usdc)
  })

  test('can redeem MMI for USDT', async () => {
    await redeemMMI(wei(1), usdt)
  })

  test('can redeem MMI for WETH', async () => {
    await redeemMMI(wei(1), weth)
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
  const quote = await getMintQuote(weth, amount)
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
  expect(balanceAfter.gte(balanceBefore.add(inputOutputAmount))).toBe(true)
}

async function redeemMMI(indexTokenAmount: BigNumber, outputToken: QuoteToken) {
  await mintMMI(wei(1.5))

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

  const { contract, inputOutputAmount, tx } = quote

  await approveErc20(mmi.address, contract, indexTokenAmount, signer)
  const balanceBefore = await balanceOf(signer, outputToken.address)

  // Estimate gas
  const gasLimit = await signer.estimateGas(tx)
  tx.gasLimit = gasLimit.mul(120).div(100)

  // Mint index
  const resp = await signer.sendTransaction(tx)
  if (!resp) fail()
  resp.wait()

  const balanceAfter = await balanceOf(signer, outputToken.address)
  expect(balanceAfter.gte(balanceBefore.add(inputOutputAmount))).toBe(true)
}
