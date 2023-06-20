/* eslint-disable  @typescript-eslint/no-non-null-assertion */
import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'

import {
  DiversifiedStakedETHIndex,
  sETH2,
  stETH,
  WETH,
  wstETH,
} from 'constants/tokens'
import { FlashMintZeroEx } from 'flashmint/zeroEx'
import { QuoteToken, ZeroExQuoteProvider } from 'quote'
import { getFlashMintZeroExContractForToken } from 'utils/contracts'
import { getIssuanceModule } from 'utils/issuanceModules'

import {
  approveErc20,
  createERC20Contract,
  LocalhostProvider,
  SignerAccount0,
  ZeroExApiSwapQuote,
} from '../utils'

const provider = LocalhostProvider

export const dsETH = {
  address: DiversifiedStakedETHIndex.address!,
  decimals: 18,
  symbol: DiversifiedStakedETHIndex.symbol,
}

export const ETH = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  decimals: 18,
  symbol: 'ETH',
}
export const RETH = {
  address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
  decimals: 18,
  symbol: 'rETH',
}
export const SETH2 = {
  address: sETH2.address!,
  decimals: 18,
  symbol: sETH2.symbol,
}
export const STETH = {
  address: stETH.address!,
  decimals: 18,
  symbol: stETH.symbol,
}
export const WETH9 = {
  address: WETH.address!,
  decimals: 18,
  symbol: WETH.symbol,
}
export const WSTETH = {
  address: wstETH.address!,
  decimals: 18,
  symbol: wstETH.symbol,
}

export async function mint(
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5,
  signer = SignerAccount0
) {
  const chainId = 1
  const zeroExApi = ZeroExApiSwapQuote

  const inputToken = ETH
  const indexToken = outputToken
  const isMinting = true

  const quoteProvider = new ZeroExQuoteProvider(provider, zeroExApi)
  const quote = await quoteProvider.getQuote({
    inputToken,
    outputToken,
    indexTokenAmount,
    isMinting,
    slippage,
  })
  expect(quote).toBeDefined()
  if (!quote) fail()
  expect(quote?.componentQuotes.length).toBeGreaterThan(0)
  expect(quote?.inputOutputTokenAmount).toBeDefined()
  expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
  expect(quote?.indexTokenAmount).toEqual(indexTokenAmount)

  // Get FlashMintZeroEx contract instance and issuance module (debtV2)
  const contract = getFlashMintZeroExContractForToken(
    indexToken.symbol,
    signer,
    chainId
  )
  const issuanceModule = getIssuanceModule(indexToken.symbol, chainId)

  const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
    indexToken.address,
    indexTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    { value: quote.inputOutputTokenAmount }
  )

  const flashMint = new FlashMintZeroEx(contract)
  const tx = await flashMint.mintExactSetFromETH(
    indexToken.address,
    indexTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    quote.inputOutputTokenAmount,
    { gasLimit: gasEstimate }
  )
  if (!tx) fail()
  tx.wait()
  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const balanceOutputToken: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  expect(balanceOutputToken.gt(0)).toEqual(true)
}

export async function mintERC20(
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5,
  signer: Wallet = SignerAccount0
) {
  const chainId = 1
  const zeroExApi = ZeroExApiSwapQuote

  const indexToken = outputToken
  const isMinting = true

  const quoteProvider = new ZeroExQuoteProvider(provider, zeroExApi)
  const quote = await quoteProvider.getQuote({
    inputToken,
    outputToken,
    indexTokenAmount,
    isMinting,
    slippage,
  })
  expect(quote).toBeDefined()
  if (!quote) fail()
  expect(quote?.componentQuotes.length).toBeGreaterThan(0)
  expect(quote?.inputOutputTokenAmount).toBeDefined()
  expect(quote?.inputOutputTokenAmount).not.toBe(BigNumber.from(0))
  expect(quote?.indexTokenAmount).toEqual(indexTokenAmount)

  // Get FlashMintZeroEx contract instance and issuance module (debtV2)
  const contract = getFlashMintZeroExContractForToken(
    indexToken.symbol,
    signer,
    chainId
  )
  const issuanceModule = getIssuanceModule(indexToken.symbol, chainId)

  await approveErc20(
    inputToken.address,
    contract.address,
    quote.inputOutputTokenAmount,
    signer
  )

  const gasEstimate = await contract.estimateGas.issueExactSetFromToken(
    indexToken.address,
    inputToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance
  )

  const flashMint = new FlashMintZeroEx(contract)
  const tx = await flashMint.mintExactSetFromToken(
    indexToken.address,
    inputToken.address,
    indexTokenAmount,
    quote.inputOutputTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    { gasLimit: gasEstimate }
  )
  if (!tx) fail()
  tx.wait()
  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const balanceOutputToken: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  expect(balanceOutputToken.gt(0)).toEqual(true)
}
