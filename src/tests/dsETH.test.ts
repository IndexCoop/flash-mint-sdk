import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'

import {
  EthereumDiversifiedStakingIndex,
  sETH2,
  stETH,
  USDC,
  WETH,
  wsETH2,
} from 'constants/tokens'
import { FlashMintZeroEx } from 'flashMint/zeroEx'
import { QuoteToken } from 'quote/quoteToken'
import { getFlashMintZeroExQuote } from 'quote/zeroEx'
import { getFlashMintZeroExContractForToken } from 'utils/contracts'
import { getIssuanceModule } from 'utils/issuanceModules'
import { wei } from 'utils/numbers'
import {
  approveErc20,
  balanceOf,
  createERC20Contract,
  LocalhostProvider,
  SignerAccount0,
  wrapETH,
  ZeroExApiSwapQuote,
} from 'tests/utils'
import { swapExactInput } from './utils/uniswap'

const provider = LocalhostProvider

const dsETH = {
  address: EthereumDiversifiedStakingIndex.address!,
  decimals: 18,
  symbol: EthereumDiversifiedStakingIndex.symbol,
}

const ETH = {
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  decimals: 18,
  symbol: 'ETH',
}
const RETH = {
  address: '0xae78736Cd615f374D3085123A210448E74Fc6393',
  decimals: 18,
  symbol: 'rETH',
}
const SETH2 = {
  address: sETH2.address!,
  decimals: 18,
  symbol: sETH2.symbol,
}
const STETH = {
  address: stETH.address!,
  decimals: 18,
  symbol: stETH.symbol,
}
const WETH9 = {
  address: WETH.address!,
  decimals: 18,
  symbol: WETH.symbol,
}
const WSETH2 = {
  address: wsETH2.address!,
  decimals: 18,
  symbol: wsETH2.symbol,
}
const WSTETH = {
  address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  decimals: 18,
  symbol: 'wstETH',
}

describe('FlashMintZeroEx - dsETH', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('minting with ETH', async () => {
    const inputToken = ETH
    const outputToken = dsETH
    const indexTokenAmount = wei('0.1')

    await mint(inputToken, outputToken, indexTokenAmount)
  })

  test('redeeming to ETH', async () => {
    const inputToken = dsETH
    const outputToken = ETH
    const indexTokenAmount = wei('0.1')

    await redeem(inputToken, outputToken, indexTokenAmount)
  })

  test('minting with WETH', async () => {
    const inputToken = WETH9
    const outputToken = dsETH
    const indexTokenAmount = wei('1')

    const signer = SignerAccount0
    await wrapETH(wei(2), signer)
    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  test('redeeming to WETH', async () => {
    const inputToken = dsETH
    const outputToken = WETH9
    const indexTokenAmount = wei('1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  test('redeeming to rETH', async () => {
    // FIXME: remove later - for testing only, minting some dsETH
    await mint(ETH, dsETH, wei('0.1'))

    const inputToken = dsETH
    const outputToken = RETH
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  test('redeeming to sETH2', async () => {
    // FIXME: remove later - for testing only, minting some dsETH
    await mint(ETH, dsETH, wei('0.1'))

    const inputToken = dsETH
    const outputToken = SETH2
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  test('redeeming to stETH', async () => {
    // FIXME: remove later - for testing only, minting some dsETH
    await mint(ETH, dsETH, wei('0.1'))

    const inputToken = dsETH
    const outputToken = STETH
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  test('redeeming to USDC', async () => {
    // FIXME: remove later - for testing only, minting some dsETH
    await mint(ETH, dsETH, wei('0.1'))

    const inputToken = dsETH
    const indexTokenAmount = wei('0.1')

    await redeemERC20(
      inputToken,
      {
        address: USDC.address!,
        decimals: 6,
        symbol: USDC.symbol,
      },
      indexTokenAmount
    )
  })

  test('redeeming to wsETH2', async () => {
    // FIXME: remove later - for testing only, minting some dsETH
    await mint(ETH, dsETH, wei('0.1'))

    const inputToken = dsETH
    const outputToken = WSETH2
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  test('redeeming to wstETH', async () => {
    // FIXME: remove later - for testing only, minting some dsETH
    await mint(ETH, dsETH, wei('0.1'))

    const inputToken = dsETH
    const outputToken = WSTETH
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })
})

async function mint(
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5
) {
  const chainId = 1
  const signer = SignerAccount0
  const zeroExApi = ZeroExApiSwapQuote

  const indexToken = outputToken
  const isMinting = true

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

  console.log(contract.address, 'contract')
  console.log(issuanceModule.address, issuanceModule.isDebtIssuance, 'issuance')

  const gasEstimate = await contract.estimateGas.issueExactSetFromETH(
    indexToken.address,
    indexTokenAmount,
    quote.componentQuotes,
    issuanceModule.address,
    issuanceModule.isDebtIssuance,
    { value: quote.inputOutputTokenAmount }
  )
  console.log(gasEstimate.toString())

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
  console.log(balanceOutputToken.toString())
  expect(balanceOutputToken.gt(0)).toEqual(true)
}

async function mintERC20(
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

  console.log(contract.address, 'contract')
  console.log(issuanceModule.address, issuanceModule.isDebtIssuance, 'issuance')

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
  console.log(gasEstimate.toString())

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
  console.log(balanceOutputToken.toString())
  expect(balanceOutputToken.gt(0)).toEqual(true)
}

async function redeem(
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5
) {
  const chainId = 1
  const signer = SignerAccount0
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

  console.log(contract.address, 'contract')
  console.log(issuanceModule.address, issuanceModule.isDebtIssuance, 'issuance')

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
  console.log(gasEstimate.toString())

  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const previousBalance: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  console.log(previousBalance.toString(), 'previous')
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
  console.log(balance.toString())
  expect(balance.lt(previousBalance)).toEqual(true)
}

async function redeemERC20(
  inputToken: QuoteToken,
  outputToken: QuoteToken,
  indexTokenAmount: BigNumber,
  slippage = 0.5
) {
  const chainId = 1
  const signer = SignerAccount0
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

  console.log(contract.address, 'contract')
  console.log(issuanceModule.address, issuanceModule.isDebtIssuance, 'issuance')

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
  console.log(gasEstimate.toString())

  const indexTokenErc20 = createERC20Contract(indexToken.address, signer)
  const outputTokenErc20 = createERC20Contract(outputToken.address, signer)
  const previousBalanceIndexToken: BigNumber = await indexTokenErc20.balanceOf(
    signer.address
  )
  const previousBalanceOutputToken: BigNumber =
    await outputTokenErc20.balanceOf(signer.address)
  console.log(previousBalanceIndexToken.toString(), 'previous')
  console.log(previousBalanceOutputToken.toString(), 'previous - output')
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
  console.log(balance.toString())
  console.log(balanceOutputToken.toString(), 'output')
  expect(balance.lt(previousBalanceIndexToken)).toEqual(true)
  expect(balanceOutputToken.gt(previousBalanceOutputToken)).toEqual(true)
}
