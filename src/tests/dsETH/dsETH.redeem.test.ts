import { BigNumber } from '@ethersproject/bignumber'

import { USDC } from 'constants/tokens'
import { FlashMintZeroEx } from 'flashMint/zeroEx'
import { QuoteToken } from 'quote/quoteToken'
import { getFlashMintZeroExQuote } from 'quote/zeroEx'
import { getFlashMintZeroExContractForToken } from 'utils/contracts'
import { getIssuanceModule } from 'utils/issuanceModules'
import { wei } from 'utils/numbers'

import {
  dsETH,
  ETH,
  WETH9,
  RETH,
  SETH2,
  STETH,
  WSTETH,
  mint,
} from './dsETH.helpers'

import {
  approveErc20,
  createERC20Contract,
  LocalhostProvider,
  SignerAccount3,
  ZeroExApiSwapQuote,
} from '../utils'

const provider = LocalhostProvider
const signer = SignerAccount3

describe('FlashMintZeroEx - dsETH - redeem', () => {
  const inputToken = dsETH
  const indexTokenAmount = wei('0.1')

  beforeAll(async () => {
    // Use different signer than dsETH.mint tests to prevent side effects

    // Mint enought dsETH for all tests to run through
    await mint(dsETH, indexTokenAmount.mul(100), 0.5, signer)
  })

  beforeEach(async () => {
    jest.setTimeout(10000000)
  })

  // FIXME: remove
  test('test', async () => {
    expect(true).toBe(true)
  })

  // test('redeeming to ETH', async () => {
  //   await redeem(inputToken, indexTokenAmount)
  // })

  // test('redeeming to WETH', async () => {
  //   const outputToken = WETH9
  //   await redeemERC20(inputToken, outputToken, indexTokenAmount)
  // })

  // test('redeeming to rETH', async () => {
  //   const outputToken = RETH
  //   await redeemERC20(inputToken, outputToken, indexTokenAmount)
  // })

  // test('redeeming to sETH2', async () => {
  //   const outputToken = SETH2
  //   await redeemERC20(inputToken, outputToken, indexTokenAmount)
  // })

  // test('redeeming to stETH', async () => {
  //   const outputToken = STETH
  //   await redeemERC20(inputToken, outputToken, indexTokenAmount)
  // })

  // test('redeeming to USDC', async () => {
  //   await redeemERC20(
  //     inputToken,
  //     {
  //       address: USDC.address!,
  //       decimals: 6,
  //       symbol: USDC.symbol,
  //     },
  //     indexTokenAmount
  //   )
  // })

  // test('redeeming to wstETH', async () => {
  //   const outputToken = WSTETH
  //   await redeemERC20(inputToken, outputToken, indexTokenAmount)
  // })
})

async function redeem(
  inputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5
) {
  const chainId = 1
  const zeroExApi = ZeroExApiSwapQuote

  const indexToken = inputToken
  const outputToken = ETH
  const isMinting = false

  const quote = await getFlashMintZeroExQuote(
    inputToken,
    outputToken,
    indexTokenAmount,
    isMinting,
    slippage,
    zeroExApi,
    provider,
    chainId
  )
  expect(quote).toBeDefined()
  if (!quote) fail()
  expect(quote?.componentQuotes.length).toBeGreaterThan(0)
  expect(quote?.inputOutputTokenAmount).toBeDefined()
  expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
  expect(quote?.setTokenAmount).toEqual(indexTokenAmount)

  // Get FlashMintZeroEx contract instance and issuance module (debtV2)
  const contract = getFlashMintZeroExContractForToken(
    indexToken.symbol,
    signer,
    chainId
  )
  const issuanceModule = getIssuanceModule(indexToken.symbol, chainId)

  await approveErc20(
    indexToken.address,
    contract.address,
    indexTokenAmount,
    signer
  )

  const gasEstimate = await contract.estimateGas.redeemExactSetForETH(
    indexToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance
  )

  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const previousBalance: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  expect(previousBalance.gt(0)).toEqual(true)

  const flashMint = new FlashMintZeroEx(contract)
  const tx = await flashMint.redeemExactSetForETH(
    indexToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    { gasLimit: gasEstimate }
  )
  if (!tx) fail()
  tx.wait()

  const balance: BigNumber = await indexTokenErc20.balanceOf(signer.address)
  expect(balance.lt(previousBalance)).toEqual(true)
}

async function redeemERC20(
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5
) {
  const chainId = 1
  const signer = SignerAccount1
  const zeroExApi = ZeroExApiSwapQuote

  const indexToken = inputToken
  const isMinting = false

  const quote = await getFlashMintZeroExQuote(
    inputToken,
    outputToken,
    indexTokenAmount,
    isMinting,
    slippage,
    zeroExApi,
    provider,
    chainId
  )
  expect(quote).toBeDefined()
  if (!quote) fail()
  expect(quote?.componentQuotes.length).toBeGreaterThan(0)
  expect(quote?.inputOutputTokenAmount).toBeDefined()
  expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
  expect(quote?.setTokenAmount).toEqual(indexTokenAmount)

  // Get FlashMintZeroEx contract instance and issuance module (debtV2)
  const contract = getFlashMintZeroExContractForToken(
    indexToken.symbol,
    signer,
    chainId
  )
  const issuanceModule = getIssuanceModule(indexToken.symbol, chainId)

  await approveErc20(
    indexToken.address,
    contract.address,
    indexTokenAmount,
    signer
  )

  const gasEstimate = await contract.estimateGas.redeemExactSetForToken(
    indexToken.address,
    outputToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance
  )

  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const outputTokenErc20 = createERC20Contract(outputToken.address, signer)
  const previousBalanceIndexToken: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  const previousBalanceOutputToken: BigNumber =
    await outputTokenErc20.balanceOf(signer.address)
  expect(previousBalanceIndexToken.gt(0)).toEqual(true)

  const flashMint = new FlashMintZeroEx(contract)
  const tx = await flashMint.redeemExactSetForToken(
    indexToken.address,
    outputToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    { gasLimit: gasEstimate }
  )
  if (!tx) fail()
  tx.wait()

  const balance: BigNumber = await indexTokenErc20.balanceOf(signer.address)
  const balanceOutputToken: BigNumber = await outputTokenErc20.balanceOf(
    signer.address
  )
  expect(balance.lt(previousBalanceIndexToken)).toEqual(true)
  expect(balanceOutputToken.gt(previousBalanceOutputToken)).toEqual(true)
}
