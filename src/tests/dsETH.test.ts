import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'

import {
  DiversifiedStakedETHIndex,
  sETH2,
  stETH,
  USDC,
  WETH,
  wsETH2,
  wstETH,
} from 'constants/tokens'
import { FlashMintZeroEx } from 'flashMint/zeroEx'
import { QuoteToken } from 'quote/quoteToken'
import { getFlashMintZeroExQuote } from 'quote/zeroEx'
import { getFlashMintZeroExContractForToken } from 'utils/contracts'
import { getIssuanceModule } from 'utils/issuanceModules'
import { wei } from 'utils/numbers'

import { addLiquidityToLido, wrapStEth } from './utils/lido'
import { depositIntoRocketPool } from './utils/rocket'
import { swapExactInput } from './utils/uniswap'
import {
  approveErc20,
  balanceOf,
  createERC20Contract,
  TenderlyProvider,
  SignerAccount0,
  wrapETH,
  ZeroExApiSwapQuote,
} from './utils'

const provider = TenderlyProvider

const dsETH = {
  address: DiversifiedStakedETHIndex.address!,
  decimals: 18,
  symbol: DiversifiedStakedETHIndex.symbol,
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
  address: wstETH.address!,
  decimals: 18,
  symbol: wstETH.symbol,
}

describe('FlashMintZeroEx - dsETH', () => {
  beforeEach((): void => {
    jest.setTimeout(10000000)
  })

  test('minting with ETH', async () => {
    const inputToken = ETH
    const outputToken = dsETH
    const indexTokenAmount = wei('0.1')

    await mint(outputToken, indexTokenAmount)
  })

  test('redeeming to ETH', async () => {
    const inputToken = dsETH
    const outputToken = ETH
    const indexTokenAmount = wei('0.1')

    await redeem(inputToken, indexTokenAmount)
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

  // FIXME: deposit into pool won't work because it reached max capacity
  // test('minting with rETH', async () => {
  //   const inputToken = RETH
  //   const outputToken = dsETH
  //   const indexTokenAmount = wei('0.1')

  //   const signer = SignerAccount0
  //   await depositIntoRocketPool(wei(2), signer)
  //   await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  // })

  test('redeeming to rETH', async () => {
    // FIXME: remove later - for testing only, minting some dsETH
    await mint(dsETH, wei('0.1'))

    const inputToken = dsETH
    const outputToken = RETH
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  test('minting with sETH2', async () => {
    const inputToken = SETH2
    const outputToken = dsETH
    const indexTokenAmount = wei('1')

    // ETH / sETH2
    const signer = SignerAccount0
    const pool = '0x7379e81228514a1d2a6cf7559203998e20598346'
    await wrapETH(wei(2), signer)
    await swapExactInput(
      pool,
      {
        tokenIn: WETH9.address,
        tokenOut: inputToken.address!,
        amountIn: wei('2'),
        amountOutMin: wei('1.5'),
      },
      provider,
      signer
    )

    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  test('redeeming to sETH2', async () => {
    const inputToken = dsETH
    const outputToken = SETH2
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  test('minting with stETH', async () => {
    const inputToken = STETH
    const outputToken = dsETH
    const indexTokenAmount = wei('0.1')

    const signer = SignerAccount0
    await addLiquidityToLido(wei('1'), signer)

    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  test('redeeming to stETH', async () => {
    const inputToken = dsETH
    const outputToken = STETH
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  // FIXME: did work a few times already
  // test('minting with USDC', async () => {
  //   const inputToken = {
  //     address: USDC.address!,
  //     decimals: 6,
  //     symbol: USDC.symbol,
  //   }
  //   const outputToken = dsETH
  //   const indexTokenAmount = wei('0.1')

  //   const signer = SignerAccount0
  //   // ETH / USDC
  //   const pool = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
  //   await wrapETH(wei(2), signer)
  //   await swapExactInput(
  //     pool,
  //     {
  //       tokenIn: WETH9.address,
  //       tokenOut: inputToken.address!,
  //       amountIn: wei('2'),
  //       amountOutMin: wei('2000', inputToken.decimals),
  //     },
  //     provider,
  //     signer
  //   )
  //   const balanceUsdc = await balanceOf(signer, inputToken.address)
  //   console.log(balanceUsdc.toString(), 'USDC')
  //
  //   await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  // })

  test('redeeming to USDC', async () => {
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

  test('minting with wsETH2', async () => {
    const inputToken = WSETH2
    const outputToken = dsETH
    const indexTokenAmount = wei('0.1')

    const signer = SignerAccount0
    await mint(WSETH2, wei(0.5), 0.5)

    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  test('redeeming to wsETH2', async () => {
    const inputToken = dsETH
    const outputToken = WSETH2
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })

  test('minting with wstETH', async () => {
    const inputToken = WSTETH
    const outputToken = dsETH
    const indexTokenAmount = wei('0.1')

    const signer = SignerAccount0
    await addLiquidityToLido(wei('2'), signer)
    const balance = await balanceOf(signer, STETH.address)
    console.log(balance.toString(), 'stETH')
    await wrapStEth(wei(1), signer)
    const balancew = await balanceOf(signer, WSTETH.address)
    console.log(balancew.toString(), 'wstETH')
    await mintERC20(inputToken, outputToken, indexTokenAmount, 0.5, signer)
  })

  test('redeeming to wstETH', async () => {
    const inputToken = dsETH
    const outputToken = WSTETH
    const indexTokenAmount = wei('0.1')

    await redeemERC20(inputToken, outputToken, indexTokenAmount)
  })
})

async function mint(
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
  indexTokenAmount: BigNumber,
  slippage = 0.5
) {
  const chainId = 1
  const signer = SignerAccount0
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
